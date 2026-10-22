import {
  type ActionName,
  appIdForAction,
  evaluatePermission,
  getActionDefinition,
  isActionsAuditEnabled,
  isAlwaysAuditedAction,
  isPlatformAdmin,
  normalizeOrgRole,
} from "@loftlancer/actions";
import { activeMemberWhere, db } from "@loftlancer/db";
import { member, organization } from "@loftlancer/db/schema/organization";
import { logger } from "@loftlancer/logger";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { isAppInstalled } from "../apps/installed";
import { hasProjectAppAccess } from "../apps/project-app-access";
import { writeAuditEvent } from "./audit-event-writer";
import { loadCustomOrganizationActions } from "./custom-role-permissions";
import { isActionBlocked } from "./is-action-blocked";
import {
  loadProjectAccessContext,
  userHasAnyProjectManagerAssignment,
} from "./project-access";
import { loadTeamAccessContext } from "./team-access";

export type RequireActionContext = {
  userId: string;
  organizationId?: string | null;
  projectId?: string | null;
  teamId?: string | null;
  targetUserId?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Extra audit payload, e.g. `{ scope: "all", count }`. */
  payload?: Record<string, unknown>;
  /**
   * Write an audit_event row for this check. Default true. Read paths (tRPC
   * queries, page guards, permission probes) pass false so that viewing a page
   * never records a mutating action such as `account.delete` or `member.invite`.
   */
  audit?: boolean;
};

/** Read/query actions never write audit events; only mutations are audited. */
const READ_ACTION_RE =
  /\.(list|view|read|get|stats|search)(\.(self|org|user))?$/;
export function isReadAction(action: string): boolean {
  return READ_ACTION_RE.test(action);
}

export async function requireAction(
  action: ActionName,
  ctx: RequireActionContext,
): Promise<void> {
  const alwaysAudit = isAlwaysAuditedAction(action);
  const auditEnabled =
    !isReadAction(action) &&
    ctx.audit !== false &&
    (alwaysAudit || isActionsAuditEnabled());
  const startedAt = Date.now();
  const def = getActionDefinition(action);
  let result: "success" | "denied" | "failure" = "denied";
  let denialReason: string | undefined;
  const archivedPromise =
    def.scope !== "user" && ctx.organizationId
      ? db
          .select({ archivedAt: organization.archivedAt })
          .from(organization)
          .where(eq(organization.id, ctx.organizationId))
          .limit(1)
      : null;

  try {
    archivedPromise?.catch(() => undefined);
    // Block check and membership lookup are independent: run them together.
    const membershipPromise =
      def.scope !== "user" && ctx.organizationId && !isPlatformAdmin()
        ? db
            .select({ id: member.id, role: member.role })
            .from(member)
            .innerJoin(organization, eq(member.organizationId, organization.id))
            .where(
              activeMemberWhere(
                and(
                  eq(member.organizationId, ctx.organizationId),
                  eq(member.userId, ctx.userId),
                  isNull(organization.deletedAt),
                ),
              ),
            )
            .limit(1)
        : null;
    membershipPromise?.catch(() => undefined);
    if (
      await isActionBlocked(action, {
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        projectId: ctx.projectId,
      })
    ) {
      denialReason = "blocked";
      throw new TRPCError({ code: "FORBIDDEN", message: "Action blocked" });
    }

    const [organizationState] = (await archivedPromise) ?? [];
    if (
      organizationState?.archivedAt &&
      !isReadAction(action) &&
      action !== "organization.unarchive" &&
      action !== "organization.restore" &&
      action !== "organization.delete"
    ) {
      denialReason = "organization_archived";
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "This organization is archived. Restore it before making changes.",
      });
    }

    const appId = appIdForAction(action);
    if (
      appId &&
      ctx.projectId &&
      !(await isAppInstalled(ctx.projectId, appId))
    ) {
      denialReason = "app_not_installed";
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This app isn't installed on the project.",
      });
    }

    if (isPlatformAdmin()) {
      result = "success";
      return;
    }

    if (def.scope === "user") {
      if (def.selfOnly && ctx.targetUserId && ctx.targetUserId !== ctx.userId) {
        denialReason = "not_self";
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
      result = "success";
      return;
    }

    if (!ctx.organizationId) {
      denialReason = "no_active_org";
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Select an organization to continue.",
      });
    }

    const [membership] = (await membershipPromise) ?? [];

    const orgRole = normalizeOrgRole(membership?.role);
    const customOrganizationActions =
      orgRole === "member" && def.scope === "organization"
        ? await loadCustomOrganizationActions(ctx.userId, ctx.organizationId)
        : [];

    const projectCtx = ctx.projectId
      ? await loadProjectAccessContext(
          ctx.userId,
          ctx.projectId,
          ctx.organizationId,
        )
      : null;
    const teamCtx = ctx.teamId
      ? await loadTeamAccessContext(ctx.userId, ctx.teamId, ctx.organizationId)
      : null;

    if (ctx.projectId && !projectCtx?.belongsToOrganization) {
      denialReason = "project_org_mismatch";
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found.",
      });
    }
    if (ctx.teamId && !teamCtx?.belongsToOrganization) {
      denialReason = "team_org_mismatch";
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Team not found.",
      });
    }

    if (
      action === "audit.timeline.view.org" &&
      orgRole === "manager" &&
      ctx.organizationId
    ) {
      const hasAssignment = await userHasAnyProjectManagerAssignment(
        ctx.userId,
        ctx.organizationId,
      );
      if (!hasAssignment) {
        denialReason = "not_project_manager";
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
    }

    const decision = evaluatePermission({
      action,
      orgRole,
      customOrganizationActions,
      project: projectCtx,
      team: teamCtx,
    });

    if (!decision.allowed) {
      denialReason = decision.reason;
      throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
    }

    if (appId && ctx.projectId && ctx.organizationId) {
      const hasAppAccess = await hasProjectAppAccess({
        userId: ctx.userId,
        organizationId: ctx.organizationId,
        projectId: ctx.projectId,
        appId,
        bypassRestriction:
          orgRole === "owner" ||
          orgRole === "manager" ||
          projectCtx?.isProjectCreator === true ||
          projectCtx?.isProjectManager === true,
      });
      if (!hasAppAccess) {
        denialReason = "app_access_denied";
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this app.",
        });
      }
    }

    if (
      action === "audit.timeline.view.user" &&
      ctx.targetUserId &&
      ctx.targetUserId !== ctx.userId &&
      orgRole !== "owner"
    ) {
      denialReason = "org_role_denied";
      throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
    }

    result = "success";
  } catch (e) {
    if (!(e instanceof TRPCError)) {
      result = "failure";
    }
    throw e;
  } finally {
    const skipDeniedSelfProbe =
      result === "denied" && def.scope === "user" && def.selfOnly === true;
    if (auditEnabled && !skipDeniedSelfProbe) {
      try {
        await writeAuditEvent({
          action,
          result,
          actorUserId: ctx.userId,
          organizationId: ctx.organizationId,
          projectId: ctx.projectId,
          entityId: ctx.entityId,
          targetUserId: ctx.targetUserId,
          denialReason,
          durationMs: Date.now() - startedAt,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          payload: ctx.payload,
        });
      } catch (auditErr) {
        logger.exception("audit_event write failed", auditErr);
      }
    }
  }
}
