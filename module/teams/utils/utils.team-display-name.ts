export function teamDisplayName(
  teamName: string,
  organizationName?: string | null,
) {
  return organizationName?.trim() &&
    teamName.trim().toLocaleLowerCase() ===
      organizationName.trim().toLocaleLowerCase()
    ? `${teamName.trim()} (Default)`
    : teamName;
}
