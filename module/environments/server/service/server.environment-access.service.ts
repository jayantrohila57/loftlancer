import { activeEnvironmentWhere, db } from "@loftlancer/drizzle";
import { environment } from "@loftlancer/drizzle/schema/projects";
import { assertProjectAccess } from "@modules/organizations/server/service/server.org-access.service";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";

export async function lookupProjectIdByEnvironmentId(
  environmentId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ projectId: environment.projectId })
    .from(environment)
    .where(activeEnvironmentWhere(eq(environment.id, environmentId)))
    .limit(1);
  return row?.projectId ?? null;
}

export async function assertEnvironmentAccess(
  userId: string,
  environmentId: string,
  organizationId: string | null,
): Promise<{ projectId: string; environmentId: string }> {
  const projectId = await lookupProjectIdByEnvironmentId(environmentId);
  if (!projectId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Environment not found",
    });
  }
  await assertProjectAccess(userId, projectId, organizationId);
  return { projectId, environmentId };
}

export async function assertEnvironmentsAccess(
  userId: string,
  environmentIds: string[],
  organizationId: string | null,
): Promise<string[]> {
  if (!environmentIds.length) {
    return [];
  }

  const rows = await db
    .select({ id: environment.id, projectId: environment.projectId })
    .from(environment)
    .where(activeEnvironmentWhere(inArray(environment.id, environmentIds)));

  const allowed: string[] = [];
  const seenProjects = new Set<string>();

  for (const row of rows) {
    if (!seenProjects.has(row.projectId)) {
      await assertProjectAccess(userId, row.projectId, organizationId);
      seenProjects.add(row.projectId);
    }
    allowed.push(row.id);
  }

  return allowed;
}
