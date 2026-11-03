export type OwnedOrganizationRow = {
  organizationId: string;
  orgName: string;
  orgSlug: string;
};

export type OrganizationOwnerCountRow = {
  organizationId: string;
  ownerCount: number;
};

/** Maps owned orgs to blockers where the org has exactly one active owner. */
export function soleOwnerBlockersFromCounts(
  owned: OwnedOrganizationRow[],
  ownerCounts: OrganizationOwnerCountRow[],
): { organizationId: string; name: string; slug: string }[] {
  const soleOwnerOrgIds = new Set(
    ownerCounts
      .filter((row) => row.ownerCount === 1)
      .map((row) => row.organizationId),
  );

  return owned
    .filter((row) => soleOwnerOrgIds.has(row.organizationId))
    .map((row) => ({
      organizationId: row.organizationId,
      name: row.orgName,
      slug: row.orgSlug,
    }));
}
