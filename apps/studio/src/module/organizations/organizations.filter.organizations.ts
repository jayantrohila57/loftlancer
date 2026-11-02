import type { OrgListItem } from "@/components/org/active-organization-context";
import { isPersonalOrganization } from "@/lib/org-personal";

export type OrganizationsSort = "name-asc" | "name-desc" | "slug-asc";

export type OrganizationsTypeFilter = "all" | "personal" | "team";

export function countOrganizationsByType(orgs: OrgListItem[]) {
  let team = 0;
  let personal = 0;
  for (const org of orgs) {
    if (isPersonalOrganization(org)) personal += 1;
    else team += 1;
  }
  return { team, personal };
}

export function filterAndSortOrganizations(
  orgs: OrgListItem[],
  {
    search,
    type,
    sort,
  }: {
    search: string;
    type: OrganizationsTypeFilter;
    sort: OrganizationsSort;
  },
): OrgListItem[] {
  const q = search.trim().toLowerCase();
  let result = orgs.filter((org) => {
    if (type === "personal" && !isPersonalOrganization(org)) return false;
    if (type === "team" && isPersonalOrganization(org)) return false;
    if (!q) return true;
    return (
      org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q)
    );
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "slug-asc":
        return a.slug.localeCompare(b.slug);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return result;
}
