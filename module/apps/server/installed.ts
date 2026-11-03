import { db } from "@loftlancer/drizzle";
import { projectApp } from "@loftlancer/drizzle/schema/project-app";
import { and, eq } from "drizzle-orm";

export async function isAppInstalled(
  projectId: string,
  appId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: projectApp.id })
    .from(projectApp)
    .where(
      and(
        eq(projectApp.projectId, projectId),
        eq(projectApp.appId, appId),
        eq(projectApp.status, "active"),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function listInstalledAppIds(projectIds: string[]) {
  if (projectIds.length === 0) return new Map<string, string[]>();
  const { inArray } = await import("drizzle-orm");
  const rows = await db
    .select({ projectId: projectApp.projectId, appId: projectApp.appId })
    .from(projectApp)
    .where(
      and(
        inArray(projectApp.projectId, projectIds),
        eq(projectApp.status, "active"),
      ),
    );
  const map = new Map<string, string[]>();
  for (const r of rows)
    map.set(r.projectId, [...(map.get(r.projectId) ?? []), r.appId]);
  return map;
}
