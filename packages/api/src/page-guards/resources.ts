import {
  activeEnvironmentWhere,
  activeMemberWhere,
  activeProjectWhere,
  db,
} from "@loftlancer/db";
import { member, organization } from "@loftlancer/db/schema/organization";
import { task } from "@loftlancer/db/schema/project-app";
import { environment, project } from "@loftlancer/db/schema/projects";
import { team } from "@loftlancer/db/schema/team";
import { and, eq, isNull } from "drizzle-orm";
import { assertProjectAccess } from "../org-access";
import { PageNotFoundError } from "./errors";

export type ResolvedOrganization = {
  id: string;
  slug: string;
  name: string;
  metadata: string | null;
};

export async function resolveOrganizationForPage(
  userId: string,
  slug: string,
): Promise<ResolvedOrganization> {
  const [row] = await db
    .select({
      id: organization.id,
      slug: organization.slug,
      name: organization.name,
      metadata: organization.metadata,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      activeMemberWhere(
        and(
          eq(member.userId, userId),
          eq(organization.slug, slug),
          isNull(organization.deletedAt),
        ),
      ),
    )
    .limit(1);

  if (!row) {
    throw new PageNotFoundError("Organization not found");
  }

  return row;
}

export type ResolvedProject = {
  id: string;
  slug: string;
  organizationId: string | null;
};

export async function assertOrganizationTeamForPage(
  organizationId: string,
  teamId: string,
): Promise<void> {
  const [row] = await db
    .select({ id: team.id })
    .from(team)
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  if (!row) throw new PageNotFoundError("Team not found");
}

export async function resolveProjectForPage(
  userId: string,
  slug: string,
  organizationId: string | null,
): Promise<ResolvedProject> {
  const scope = organizationId
    ? and(eq(project.slug, slug), eq(project.organizationId, organizationId))
    : eq(project.slug, slug);

  const [row] = await db
    .select({
      id: project.id,
      slug: project.slug,
      organizationId: project.organizationId,
    })
    .from(project)
    .where(activeProjectWhere(scope))
    .limit(1);

  if (!row) {
    throw new PageNotFoundError("Project not found");
  }

  await assertProjectAccess(userId, row.id, organizationId);

  return row;
}

/**
 * /[org]/[project]/env/[envSlug]: 404 when the project has no such environment
 * (#309). Call after resolveProjectForPage, which checks access.
 */
export async function assertProjectEnvironmentForPage(
  projectId: string,
  envSlug: string,
): Promise<void> {
  const [row] = await db
    .select({ id: environment.id })
    .from(environment)
    .where(
      activeEnvironmentWhere(
        and(
          eq(environment.projectId, projectId),
          eq(environment.slug, envSlug),
        ),
      ),
    )
    .limit(1);
  if (!row) {
    throw new PageNotFoundError("Environment not found");
  }
}

/**
 * /[org]/[project]/tasks/[number]: 404 when the project has no such task
 * (#309). Call after resolveProjectForPage, which checks access.
 */
export async function assertProjectTaskForPage(
  projectId: string,
  taskNumber: number,
): Promise<void> {
  const [row] = await db
    .select({ id: task.id })
    .from(task)
    .where(
      and(
        eq(task.projectId, projectId),
        eq(task.number, taskNumber),
        isNull(task.deletedAt),
      ),
    )
    .limit(1);
  if (!row) {
    throw new PageNotFoundError("Task not found");
  }
}
