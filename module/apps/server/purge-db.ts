import { db } from "@loftlancer/drizzle";
import { projectApp, task } from "@loftlancer/drizzle/schema/project-app";
import {
  environment,
  environmentVariable,
} from "@loftlancer/drizzle/schema/projects";
import { and, eq, inArray, isNotNull, lte } from "drizzle-orm";

import type { PurgeDeps } from "./purge";

async function deleteAppData(
  appId: string,
  projectId: string,
): Promise<number> {
  if (appId === "tasks") {
    // task_comment rows cascade from task.
    const res = await db
      .delete(task)
      .where(eq(task.projectId, projectId))
      .returning({ id: task.id });
    return res.length;
  }
  if (appId === "env") {
    const envs = await db
      .select({ id: environment.id })
      .from(environment)
      .where(eq(environment.projectId, projectId));
    const ids = envs.map((e) => e.id);
    if (ids.length === 0) return 0;
    const vars = await db
      .delete(environmentVariable)
      .where(inArray(environmentVariable.environmentId, ids))
      .returning({ id: environmentVariable.id });
    await db.delete(environment).where(inArray(environment.id, ids));
    return vars.length + ids.length;
  }
  return 0;
}

export const dbPurgeDeps: PurgeDeps = {
  listCandidates: (now, limit) =>
    db
      .select({
        id: projectApp.id,
        appId: projectApp.appId,
        projectId: projectApp.projectId,
        status: projectApp.status,
        purgeAfter: projectApp.purgeAfter,
      })
      .from(projectApp)
      .where(
        and(
          eq(projectApp.status, "uninstalled"),
          isNotNull(projectApp.purgeAfter),
          lte(projectApp.purgeAfter, now),
        ),
      )
      .limit(limit),
  deleteAppData,
  markPurged: async (id, now) => {
    const res = await db
      .update(projectApp)
      .set({ status: "purged", settings: {}, updatedAt: now })
      .where(and(eq(projectApp.id, id), eq(projectApp.status, "uninstalled")))
      .returning({ id: projectApp.id });
    return res.length > 0;
  },
};
