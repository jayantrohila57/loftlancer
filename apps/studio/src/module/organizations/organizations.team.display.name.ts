export function teamDisplayName(
  team: { name?: string | null } | null | undefined,
): string {
  return team?.name?.trim() || "Team";
}
