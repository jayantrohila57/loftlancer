import { activeEnvironmentWhere, db } from "@loftlancer/db";
import {
  environment,
  environmentVariable,
} from "@loftlancer/db/schema/projects";
import { eq } from "drizzle-orm";
import type { RequireActionContext } from "./require-action";

export function projectIdFromInput(
  input: unknown,
): Partial<RequireActionContext> {
  if (!input || typeof input !== "object") {
    return {};
  }
  const record = input as Record<string, unknown>;
  if (typeof record.projectId === "string") {
    return { projectId: record.projectId };
  }
  if (typeof record.id === "string" && !record.environmentId) {
    return { projectId: record.id };
  }
  return {};
}

export async function projectIdForEnvironmentId(
  environmentId: string,
): Promise<string | null> {
  const rows = await db
    .select({ projectId: environment.projectId })
    .from(environment)
    .where(activeEnvironmentWhere(eq(environment.id, environmentId)))
    .limit(1);
  return rows[0]?.projectId ?? null;
}

export async function projectIdForEnvironmentInput(
  input: unknown,
): Promise<Partial<RequireActionContext>> {
  if (!input || typeof input !== "object") {
    return {};
  }
  const record = input as Record<string, unknown>;
  if (typeof record.projectId === "string") {
    return { projectId: record.projectId };
  }
  const envId =
    typeof record.environmentId === "string"
      ? record.environmentId
      : typeof record.id === "string"
        ? record.id
        : null;
  if (!envId) {
    return {};
  }
  const projectId = await projectIdForEnvironmentId(envId);
  return { projectId };
}

export async function projectIdForVariableInput(
  input: unknown,
): Promise<Partial<RequireActionContext>> {
  if (!input || typeof input !== "object") {
    return {};
  }
  const record = input as Record<string, unknown>;
  if (typeof record.environmentId === "string") {
    return projectIdForEnvironmentInput({
      environmentId: record.environmentId,
    });
  }
  if (typeof record.id === "string") {
    const rows = await db
      .select({ environmentId: environmentVariable.environmentId })
      .from(environmentVariable)
      .where(eq(environmentVariable.id, record.id))
      .limit(1);
    const environmentId = rows[0]?.environmentId;
    if (!environmentId) {
      return {};
    }
    return projectIdForEnvironmentInput({ environmentId });
  }
  if (
    Array.isArray(record.environmentIds) &&
    record.environmentIds.length > 0 &&
    typeof record.environmentIds[0] === "string"
  ) {
    return projectIdForEnvironmentInput({
      environmentId: record.environmentIds[0],
    });
  }
  return {};
}
