import { z } from "zod/v3";
import { actionDefinitions, actionNames } from "./registry-data";
import type { ActionDefinition, ActionName } from "./types";

export { actionNames } from "./registry-data";

export const actionRegistry: Record<ActionName, ActionDefinition> =
  Object.fromEntries(actionDefinitions.map((d) => [d.name, d])) as Record<
    ActionName,
    ActionDefinition
  >;

export const actionNameSchema = z.enum(
  actionNames as [ActionName, ...ActionName[]],
);

export const PROJECT_GRANT_KEYS = [
  "project.read",
  "project.update",
  "project.archive",
  "project.unarchive",
  "project.status.change",
  "project.public.toggle",
  "project.assign_team",
  "project.permission.grant",
  "project.restore",
  "environment.read",
  "environment.create",
  "environment.update",
  "environment.delete",
  "environment.restore",
  "variable.read",
  "variable.create",
  "variable.update",
  "variable.delete",
  "variable.reveal",
  "variable.export",
  "variable.bulk_import",
  "variable.restore",
  "audit.timeline.view.project",
] as const;

export type ProjectGrantKey = (typeof PROJECT_GRANT_KEYS)[number];

export function getActionDefinition(name: ActionName): ActionDefinition {
  const def = actionRegistry[name];
  if (!def) {
    throw new Error(`Unknown action: ${name}`);
  }
  return def;
}

/** Security and critical actions are always recorded, even when optional audit
 * telemetry is disabled. */
export function isAlwaysAuditedAction(name: ActionName): boolean {
  const severity = getActionDefinition(name).audit.severity;
  return severity === "security" || severity === "critical";
}
