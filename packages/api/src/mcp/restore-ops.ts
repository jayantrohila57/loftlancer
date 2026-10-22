import { db } from "@loftlancer/db";
import {
  environment,
  environmentVariable,
  project,
} from "@loftlancer/db/schema/projects";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { requireAction } from "../actions/require-action";

export async function mcpProjectRestore(
  userId: string,
  organizationId: string,
  projectId: string,
) {
  await requireAction("project.restore", {
    userId,
    organizationId,
    projectId,
  });
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const row = await db.transaction(async (tx) => {
    const [deletedProject] = await tx
      .select({ deletedAt: project.deletedAt })
      .from(project)
      .where(
        and(
          eq(project.id, projectId),
          eq(project.organizationId, organizationId),
          isNotNull(project.deletedAt),
        ),
      )
      .limit(1);
    if (!deletedProject?.deletedAt) return null;

    const deletedAt = deletedProject.deletedAt;
    const environments = await tx
      .select({ id: environment.id })
      .from(environment)
      .where(
        and(
          eq(environment.projectId, projectId),
          eq(environment.deletedAt, deletedAt),
        ),
      );
    const environmentIds = environments.map((row) => row.id);
    if (environmentIds.length > 0) {
      await tx
        .update(environmentVariable)
        .set({ deletedAt: null, deletedBy: null })
        .where(
          and(
            inArray(environmentVariable.environmentId, environmentIds),
            eq(environmentVariable.deletedAt, deletedAt),
          ),
        );
      await tx
        .update(environment)
        .set({ deletedAt: null, deletedBy: null })
        .where(
          and(
            eq(environment.projectId, projectId),
            eq(environment.deletedAt, deletedAt),
          ),
        );
    }

    const [restoredProject] = await tx
      .update(project)
      .set({ deletedAt: null, deletedBy: null })
      .where(
        and(
          eq(project.id, projectId),
          eq(project.organizationId, organizationId),
          eq(project.deletedAt, deletedAt),
        ),
      )
      .returning({ id: project.id, slug: project.slug });
    return restoredProject ?? null;
  });
  if (!row) {
    throw new Error("project_not_found");
  }
  return row;
}

export async function mcpEnvironmentRestore(
  userId: string,
  organizationId: string,
  projectId: string,
  environmentId: string,
) {
  await requireAction("environment.restore", {
    userId,
    organizationId,
    projectId,
  });
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const [row] = await db
    .update(environment)
    .set({ deletedAt: null, deletedBy: null })
    .where(
      and(
        eq(environment.id, environmentId),
        eq(environment.projectId, projectId),
      ),
    )
    .returning({ id: environment.id, slug: environment.slug });
  if (!row) {
    throw new Error("environment_not_found");
  }
  return row;
}

export async function mcpVariableRestore(
  userId: string,
  organizationId: string,
  projectId: string,
  variableId: string,
) {
  await requireAction("variable.restore", {
    userId,
    organizationId,
    projectId,
  });
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const [row] = await db
    .update(environmentVariable)
    .set({ deletedAt: null, deletedBy: null })
    .where(eq(environmentVariable.id, variableId))
    .returning({ id: environmentVariable.id, key: environmentVariable.key });
  if (!row) {
    throw new Error("variable_not_found");
  }
  return row;
}
