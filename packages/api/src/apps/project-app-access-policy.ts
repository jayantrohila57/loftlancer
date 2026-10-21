export type ProjectAppAccessMode = "inherited" | "restricted";

export function isProjectAppAccessAllowed(input: {
  mode: ProjectAppAccessMode | null;
  hasDirectGrant?: boolean;
  hasLinkedTeamGrant?: boolean;
  bypassRestriction?: boolean;
}): boolean {
  if (!input.mode) return false;
  if (input.mode === "inherited" || input.bypassRestriction) return true;
  return input.hasDirectGrant === true || input.hasLinkedTeamGrant === true;
}
