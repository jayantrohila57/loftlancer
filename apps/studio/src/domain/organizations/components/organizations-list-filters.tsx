"use client";

import { layoutGapClass } from "@loftlancer/ui/layout-spacing";
import type { ReactNode } from "react";
import { DataTableClearFiltersButton } from "@/components/data-table/data-table-clear-filters-button";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableFilterSelect } from "@/components/data-table/data-table-filter-select";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { AppIcon } from "@/components/patterns/app-icon";
import { cn } from "@/lib/utils";
import {
  countOrganizationsByType,
  type OrganizationsSort,
  type OrganizationsTypeFilter,
} from "../lib/filter-organizations";

type OrganizationsListFiltersBarProps = {
  orgs: OrgListItem[];
  type: OrganizationsTypeFilter;
  sort: OrganizationsSort;
  onTypeChange: (value: OrganizationsTypeFilter) => void | Promise<void>;
  onSortChange: (value: OrganizationsSort) => void | Promise<void>;
  onClear: () => void;
  filtersActive: boolean;
  tableLoading?: boolean;
};

type OrgTypeFacet = Exclude<OrganizationsTypeFilter, "all">;

const TYPE_OPTIONS: { value: OrgTypeFacet; icon: ReactNode }[] = [
  { value: "team", icon: <AppIcon name="member" className="size-4" /> },
  { value: "personal", icon: <AppIcon name="user" className="size-4" /> },
];

const SORT_OPTIONS: {
  value: OrganizationsSort;
  label: string;
  icon: "listView";
}[] = [
  {
    value: "name-asc",
    label: "Name (A–Z)",
    icon: "listView",
  },
  {
    value: "name-desc",
    label: "Name (Z–A)",
    icon: "listView",
  },
  {
    value: "slug-asc",
    label: "Slug (A–Z)",
    icon: "listView",
  },
];

export function OrganizationsListFiltersBar({
  orgs,
  type,
  sort,
  onTypeChange,
  onSortChange,
  onClear,
  filtersActive,
  tableLoading = false,
}: OrganizationsListFiltersBarProps) {
  const typeCounts = countOrganizationsByType(orgs);

  const typeApplied: OrgTypeFacet[] =
    type === "all" ? [] : ([type] as OrgTypeFacet[]);

  return (
    <div className={cn("flex flex-wrap items-center", layoutGapClass)}>
      <DataTableFacetedFilter<OrgTypeFacet>
        title="Type"
        filterIcon="organization"
        ariaLabel="Filter by organization type"
        value={typeApplied}
        onValueChange={async (next) => {
          await onTypeChange(next[0] ?? "all");
        }}
        multiple={false}
        options={TYPE_OPTIONS.map((option) => ({
          ...option,
          count: typeCounts[option.value],
        }))}
      />
      <DataTableFilterSelect
        value={sort}
        onValueChange={(next) => void onSortChange(next as OrganizationsSort)}
        options={SORT_OPTIONS}
        triggerIcon="listView"
        placeholder="Sort"
        ariaLabel="Sort organizations"
        disabled={tableLoading}
      />

      {filtersActive ? (
        <DataTableClearFiltersButton
          onClick={onClear}
          disabled={tableLoading}
        />
      ) : null}
    </div>
  );
}
