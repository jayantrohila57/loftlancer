import { normalizeOrgRole } from "@loftlancer/actions";
import { activeMemberWhere, activeProjectWhere, db } from "@loftlancer/db";
import { member } from "@loftlancer/db/schema/organization";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { teamMember } from "@loftlancer/db/schema/team";
import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { and, eq, inArray, isNull, type SQL, sql } from "drizzle-orm";
import { projectListFilter } from "./org-access";

export async function listAccessibleProjectIds(
  userId: string,
  organizationId: string | null,
): Promise<string[] | null> {
  if (!isOrganizationsEnabled() || !organizationId) {
    return null;
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
  if (!orgRole) return [];

  if (orgRole === "owner") {
    const rows = await db
      .select({ id: project.id })
      .from(project)
      .where(
        and(
          eq(project.organizationId, organizationId),
          isNull(project.deletedAt),
        ),
      );
    return rows.map((r) => r.id);
  }

  if (orgRole === "manager") {
    const managedRows = await db
      .select({ id: project.id })
      .from(project)
      .innerJoin(
        projectManager,
        and(
          eq(projectManager.projectId, project.id),
          eq(projectManager.userId, userId),
          isNull(projectManager.deletedAt),
        ),
      )
      .where(
        and(
          eq(project.organizationId, organizationId),
          isNull(project.deletedAt),
        ),
      );

    const createdRows = await db
      .select({ id: project.id })
      .from(project)
      .where(
        and(
          eq(project.organizationId, organizationId),
          eq(project.userId, userId),
          isNull(project.deletedAt),
        ),
      );

    return [
      ...new Set([
        ...managedRows.map((r) => r.id),
        ...createdRows.map((r) => r.id),
      ]),
    ];
  }

  const teamProjects = await db
    .select({ projectId: projectTeam.projectId })
    .from(projectTeam)
    .innerJoin(teamMember, eq(teamMember.teamId, projectTeam.teamId))
    .innerJoin(
      projectMemberGrant,
      and(
        eq(projectMemberGrant.projectId, projectTeam.projectId),
        eq(projectMemberGrant.userId, userId),
        isNull(projectMemberGrant.deletedAt),
        sql`'project.read' = ANY(${projectMemberGrant.grants})`,
      ),
    )
    .where(
      and(
        eq(teamMember.userId, userId),
        eq(projectTeam.organizationId, organizationId),
        isNull(projectTeam.deletedAt),
      ),
    );

  const ids = [...new Set(teamProjects.map((r) => r.projectId))];
  if (!ids.length) return [];

  const rows = await db
    .select({ id: project.id })
    .from(project)
    .where(
      and(
        inArray(project.id, ids),
        eq(project.organizationId, organizationId),
        isNull(project.deletedAt),
      ),
    );
  return rows.map((r) => r.id);
}

export function projectIdsFilter(projectIds: string[] | null) {
  if (projectIds === null) return undefined;
  if (!projectIds.length) {
    return sql`false`;
  }
  return inArray(project.id, projectIds);
}

/** Shared read scope for project rows (list, getBySlug, stats, mutations). */
export async function projectReadWhere(
  userId: string,
  organizationId: string | null,
): Promise<SQL | undefined> {
  const accessibleIds = await listAccessibleProjectIds(userId, organizationId);
  if (accessibleIds === null) {
    return projectListFilter(userId, organizationId);
  }

  const orgScope =
    isOrganizationsEnabled() && organizationId
      ? eq(project.organizationId, organizationId)
      : undefined;
  const idFilter = projectIdsFilter(accessibleIds);
  if (!orgScope) {
    return activeProjectWhere(idFilter);
  }
  return activeProjectWhere(and(orgScope, idFilter));
}

/** Resolve a slug only among projects the caller can read (same scope as list). */
export async function findReadableProjectIdBySlug(
  userId: string,
  organizationId: string | null,
  slug: string,
): Promise<string | null> {
  const readScope = await projectReadWhere(userId, organizationId);
  const [row] = await db
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.slug, slug), readScope))
    .limit(1);
  return row?.id ?? null;
}
