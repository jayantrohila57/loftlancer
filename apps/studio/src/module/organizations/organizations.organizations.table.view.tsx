"use client";

import { DataTable } from "@loftlancer/ui/data-table/data-table";
import type { DataTableEmptyConfig } from "@loftlancer/ui/data-table/data-table-empty-types";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { createOrganizationsTableColumns } from "@/module/organizations/organizations.organizations.table.columns";

export function OrganizationsTableView({
  orgs,
  activeOrganizationId,
  empty,
}: {
  orgs: OrgListItem[];
  activeOrganizationId: string | null;
  empty?: DataTableEmptyConfig;
}) {
  const columns = createOrganizationsTableColumns(activeOrganizationId);

  return (
    <DataTable
      data={orgs}
      columns={columns}
      caption="Your organizations"
      captionSrOnly
      searchable={false}
      empty={empty}
    />
  );
}
