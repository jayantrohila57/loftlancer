import { canReadProject, normalizeOrgRole } from "@loftlancer/actions";
import type { AuthSession } from "@loftlancer/auth";
import { getSessionActiveOrganizationId } from "@loftlancer/auth";
import { activeMemberWhere, activeProjectWhere, db } from "@loftlancer/db";
import { member } from "@loftlancer/db/schema/organization";
import { project } from "@loftlancer/db/schema/projects";
import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { loadProjectAccessContext } from "./actions/project-access";

export function getActiveOrganizationId(ctx: AuthSession): string | null {
  return getSessionActiveOrganizationId(ctx);
}

export async function requireActiveOrganization(
  ctx: AuthSession,
): Promise<string> {
  if (!isOrganizationsEnabled()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organizations are not enabled.",
    });
  }

  const organizationId = getActiveOrganizationId(ctx);
  if (!organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Select or create an organization to continue.",
    });
  }

  const membership = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(
      activeMemberWhere(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, ctx.user.id),
        ),
      ),
    )
    .limit(1);

  if (!membership.length) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this organization.",
    });
  }

  return organizationId;
}

export function projectListFilter(
  userId: string,
  organizationId: string | null,
) {
  const scope =
    isOrganizationsEnabled() && organizationId
      ? and(
          eq(project.userId, userId),
          eq(project.organizationId, organizationId),
        )
      : eq(project.userId, userId);
  return activeProjectWhere(scope);
}

export async function resolveOrgContext(auth: AuthSession) {
  const userId = auth.user.id;
  if (!isOrganizationsEnabled()) {
    return { userId, organizationId: null as string | null };
  }
  const organizationId = await requireActiveOrganization(auth);
  return { userId, organizationId };
}

export async function attachProjectToOrganization(
  projectId: string,
  organizationId: string,
) {
  if (!isOrganizationsEnabled()) return;
  await db
    .update(project)
    .set({ organizationId })
    .where(
      activeProjectWhere(
        and(eq(project.id, projectId), isNull(project.organizationId)),
      ),
    );
}

export async function assertProjectAccess(
  userId: string,
  projectId: string,
  organizationId: string | null,
) {
  if (isOrganizationsEnabled() && organizationId) {
    const [proj] = await db
      .select({ id: project.id })
      .from(project)
      .where(
        activeProjectWhere(
          and(
            eq(project.id, projectId),
            eq(project.organizationId, organizationId),
          ),
        ),
      )
      .limit(1);

    if (!proj) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const [membership] = await db
      .select({ role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, userId),
          ),
        ),
      )
      .limit(1);

    const orgRole = normalizeOrgRole(membership?.role);
    const projectCtx = await loadProjectAccessContext(userId, projectId);

    if (!canReadProject(orgRole, projectCtx)) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }
    return;
  }

  const rows = await db
    .select({ id: project.id })
    .from(project)
    .where(
      activeProjectWhere(
        isOrganizationsEnabled() && organizationId
          ? and(
              eq(project.id, projectId),
              eq(project.userId, userId),
              eq(project.organizationId, organizationId),
            )
          : and(eq(project.id, projectId), eq(project.userId, userId)),
      ),
    )
    .limit(1);

  if (!rows.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }
}
