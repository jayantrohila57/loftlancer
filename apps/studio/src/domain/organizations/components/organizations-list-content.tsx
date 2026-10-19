"use client";

import { DataTableToolbar } from "@loftlancer/ui/data-table/data-table-toolbar";
import { layoutSectionStackClass } from "@loftlancer/ui/layout-spacing";
import { useCallback, useMemo, useState } from "react";
import { runDataTableClearAllFilters } from "@/components/data-table/run-data-table-clear-all-filters";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { FilteredListNoResultsEmpty } from "@/components/patterns/filtered-list-no-results-empty";
import { cn } from "@/lib/utils";
import { useOrganizationsListParams } from "../hooks/use-organizations-list-params";
import { filterAndSortOrganizations } from "../lib/filter-organizations";
import { OrganizationsListFiltersBar } from "./organizations-list-filters";
import { OrganizationsTableView } from "./organizations-table-view";

export function OrganizationsListContent() {
  const { orgs, activeOrganizationId } = useActiveOrganization();
  const params = useOrganizationsListParams();
  const [filterTableLoading, setFilterTableLoading] = useState(false);

  const handleClearAllFilters = useCallback(async () => {
    setFilterTableLoading(true);
    try {
      await runDataTableClearAllFilters(params.clearFilters);
    } finally {
      setFilterTableLoading(false);
    }
  }, [params.clearFilters]);

  const filtered = useMemo(
    () =>
      filterAndSortOrganizations(orgs, {
        search: params.search,
        type: params.type,
        sort: params.sort,
      }),
    [orgs, params.search, params.sort, params.type],
  );

  const emptyNoResults = (
    <FilteredListNoResultsEmpty title="No matching organizations" />
  );

  return (
    <div className={cn(layoutSectionStackClass)}>
      <DataTableToolbar
        searchPlaceholder="Search organizations…"
        searchValue={params.search}
        onSearchChange={params.setSearch}
        filter={
          <OrganizationsListFiltersBar
            orgs={orgs}
            type={params.type}
            sort={params.sort}
            onTypeChange={params.setType}
            onSortChange={params.setSort}
            onClear={() => void handleClearAllFilters()}
            filtersActive={params.filtersActive}
            tableLoading={filterTableLoading}
          />
        }
      />

      {filtered.length === 0 ? (
        params.filtersActive ? (
          emptyNoResults
        ) : null
      ) : (
        <OrganizationsTableView
          orgs={filtered}
          activeOrganizationId={activeOrganizationId}
        />
      )}
    </div>
  );
}
