"use client";

import { DataTableToolbar } from "@loftlancer/ui/data-table/data-table-toolbar";
import { layoutSectionStackClass } from "@loftlancer/ui/layout-spacing";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { runDataTableClearAllFilters } from "@/components/data-table/run-data-table-clear-all-filters";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { FilteredListNoResultsEmpty } from "@/components/patterns/filtered-list-no-results-empty";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useOrganizationsListParams } from "../hooks/use-organizations-list-params";
import { filterAndSortOrganizations } from "../lib/filter-organizations";
import { OrganizationsListFiltersBar } from "./organizations-list-filters";
import { OrganizationsTableView } from "./organizations-table-view";

export function OrganizationsListContent() {
  const { orgs, activeOrganizationId } = useActiveOrganization();
  const lifecycleQuery = useQuery(trpc.organizations.list.queryOptions());
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

  const orgsWithLifecycle = useMemo(() => {
    const byId = new Map(
      (lifecycleQuery.data?.items ?? []).map((item) => [
        item.id,
        item.archivedAt,
      ]),
    );
    return orgs.map((org) => ({
      ...org,
      archivedAt: byId.get(org.id) ?? null,
    }));
  }, [lifecycleQuery.data?.items, orgs]);
  const filtered = useMemo(
    () =>
      filterAndSortOrganizations(orgsWithLifecycle, {
        search: params.search,
        type: params.type,
        sort: params.sort,
      }),
    [orgsWithLifecycle, params.search, params.sort, params.type],
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
            orgs={orgsWithLifecycle}
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
