import { isActionsAuditEnabled } from "@features/authorization/utils";
import {
  activeEnvironmentVariableWhere,
  activeEnvironmentWhere,
  activeNotificationWhere,
  activeProjectWhere,
  db,
  deletedAccountUserUpdate,
} from "@loftlancer/drizzle";
import { auditLog } from "@loftlancer/drizzle/schema/audit";
import { auditEvent } from "@loftlancer/drizzle/schema/audit-event";
import { account, session, user } from "@loftlancer/drizzle/schema/auth";
import { notification } from "@loftlancer/drizzle/schema/notifications";
import { member } from "@loftlancer/drizzle/schema/organization";
import {
  environment,
  environmentVariable,
  project,
} from "@loftlancer/drizzle/schema/projects";
import {
  accountConnectedOutput,
  accountDeleteBlockerOutput,
  makeResponseSchema,
  respond,
} from "@modules/projects/utils/validation/utils.project-environment.validation";
import { TRPCError } from "@trpc/server";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { requireAction } from "../actions/require-action";
import { requireUserAction } from "../actions/require-user-action";
import { protectedProcedure, router } from "../index";
import { findSoleOwnerOrganizations } from "./find-sole-owner-organizations";

export const accountRouter = router({
  listConnectedAccounts: protectedProcedure
    .use(actionGuard("account.list"))
    .output(makeResponseSchema(z.array(accountConnectedOutput)))
    .query(async ({ ctx }) => {
      const rows = await db
        .select({
          id: account.id,
          providerId: account.providerId,
          accountId: account.accountId,
          scope: account.scope,
          createdAt: account.createdAt,
        })
        .from(account)
        .where(eq(account.userId, ctx.session.user.id))
        .orderBy(desc(account.createdAt));

      return respond({
        message: "Connected accounts fetched",
        data: rows.map((row) => ({
          id: row.id,
          providerId: row.providerId,
          accountId: row.accountId,
          scope: row.scope,
          createdAt:
            row.createdAt instanceof Date
              ? row.createdAt.toISOString()
              : String(row.createdAt),
        })),
      });
    }),

  getDeleteBlockers: protectedProcedure
    .use(actionGuard("account.delete"))
    .output(makeResponseSchema(accountDeleteBlockerOutput))
    .query(async ({ ctx }) => {
      const soleOwnerOrgs = await findSoleOwnerOrganizations(
        ctx.session.user.id,
      );
      return respond({
        message: "Delete blockers fetched",
        data: {
          soleOwnerOrganizations: soleOwnerOrgs,
          canDelete: soleOwnerOrgs.length === 0,
        },
      });
    }),

  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await requireUserAction("account.export", userId);

    const [
      profileRow,
      accounts,
      projectsOwned,
      memberships,
      notifications,
      auditRows,
      sessionRows,
    ] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1),
      db
        .select({
          providerId: account.providerId,
          accountId: account.accountId,
          scope: account.scope,
          createdAt: account.createdAt,
        })
        .from(account)
        .where(eq(account.userId, userId)),
      db
        .select()
        .from(project)
        .where(activeProjectWhere(eq(project.userId, userId))),
      db.select().from(member).where(eq(member.userId, userId)),
      db
        .select()
        .from(notification)
        .where(
          activeNotificationWhere(eq(notification.recipientUserId, userId)),
        ),
      db
        .select({
          id: auditLog.id,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entitySlug: auditLog.entitySlug,
          projectId: auditLog.projectId,
          environmentId: auditLog.environmentId,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .where(eq(auditLog.userId, userId))
        .orderBy(desc(auditLog.createdAt))
        .limit(500),
      db
        .select({
          id: session.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        })
        .from(session)
        .where(eq(session.userId, userId)),
    ]);

    let auditEvents: unknown[] = [];
    if (isActionsAuditEnabled()) {
      try {
        auditEvents = await db
          .select()
          .from(auditEvent)
          .where(eq(auditEvent.actorUserId, userId))
          .limit(1000);
      } catch {
        auditEvents = [];
      }
    }

    const projectIds = projectsOwned.map((p) => p.id);
    const environments =
      projectIds.length > 0
        ? await db
            .select({
              id: environment.id,
              name: environment.name,
              slug: environment.slug,
              status: environment.status,
              isProduction: environment.isProduction,
              projectId: environment.projectId,
              createdAt: environment.createdAt,
              updatedAt: environment.updatedAt,
            })
            .from(environment)
            .where(
              activeEnvironmentWhere(
                inArray(environment.projectId, projectIds),
              ),
            )
        : [];

    const environmentIds = environments.map((e) => e.id);
    const variables =
      environmentIds.length > 0
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
            })
            .from(environmentVariable)
            .where(
              activeEnvironmentVariableWhere(
                inArray(environmentVariable.environmentId, environmentIds),
              ),
            )
        : [];

    const profile = profileRow[0];

    return {
      exportedAt: new Date().toISOString(),
      note: "Variable values are omitted from exports; only keys and metadata are included.",
      profile,
      connectedAccounts: accounts,
      sessions: sessionRows,
      memberships,
      projects: projectsOwned,
      environments,
      variables,
      notifications,
      auditLog: auditRows,
      auditEvents,
    };
  }),

  softDelete: protectedProcedure
    .use(actionGuard("account.delete"))
    .output(makeResponseSchema(z.object({ success: z.literal(true) })))
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      if (isActionsAuditEnabled()) {
        await requireAction("account.delete", { userId });
      }

      const blockers = await findSoleOwnerOrganizations(userId);
      if (blockers.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Transfer organization ownership before deleting your account.",
        });
      }

      await db
        .update(user)
        .set(deletedAccountUserUpdate(userId))
        .where(eq(user.id, userId));

      await db.delete(session).where(eq(session.userId, userId));

      return respond({
        message: "Account deleted",
        data: { success: true },
      });
    }),
});
