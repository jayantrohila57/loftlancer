/**
 * Organizations are disabled by default so production keeps working on the
 * pre-migration schema. Enable only after ORGANIZATION_MIGRATION.md is complete.
 */
export function isOrganizationsEnabled(): boolean {
  return process.env.ORGANIZATIONS_ENABLED === "true";
}

export function isOrganizationsEnabledOnClient(): boolean {
  return process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED === "true";
}
