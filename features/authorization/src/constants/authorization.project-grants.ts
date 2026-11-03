import type { ActionName } from "../types/authorization.action.types";

/** Grant keys managers may assign to org members on a project (spec §6.1). */
export const PROJECT_MEMBER_GRANT_KEYS = [
  "project.read",
  "environment.read",
  "environment.create",
  "environment.update",
  "environment.delete",
  "variable.read",
  "variable.create",
  "variable.update",
  "variable.delete",
  "variable.reveal",
  "variable.export",
  "tasks.task.create",
  "tasks.task.update",
  "tasks.task.delete",
] as const satisfies readonly ActionName[];

export type ProjectMemberGrantKey = (typeof PROJECT_MEMBER_GRANT_KEYS)[number];

/** Default grants when a team is linked to a project (no reveal). */
export const DEFAULT_TEAM_PROJECT_GRANTS: ProjectMemberGrantKey[] = [
  "project.read",
  "environment.read",
  "variable.read",
];

export function isProjectMemberGrantKey(
  value: string,
): value is ProjectMemberGrantKey {
  return (PROJECT_MEMBER_GRANT_KEYS as readonly string[]).includes(value);
}

export function mergeProjectMemberGrants(
  existing: string[],
  additions: readonly string[],
): string[] {
  const set = new Set(existing);
  for (const grant of additions) {
    if (isProjectMemberGrantKey(grant)) {
      set.add(grant);
    }
  }
  return [...set].sort();
}
