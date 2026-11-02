/** Distinguish an organization's default team when both share the same name. */
export function teamDisplayName(
  teamName: string,
  organizationName?: string | null,
): string {
  const normalize = (value: string) => value.trim().toLocaleLowerCase();
  if (
    organizationName?.trim() &&
    normalize(teamName) === normalize(organizationName)
  ) {
    return `${teamName.trim()} (Default)`;
  }
  return teamName;
}
