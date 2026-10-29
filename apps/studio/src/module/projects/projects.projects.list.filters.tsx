"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { layoutGapClass } from "@loftlancer/ui/layout-spacing";
import { DataTableClearFiltersButton } from "@/components/data-table/data-table-clear-filters-button";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableFilterSelect } from "@/components/data-table/data-table-filter-select";
import {
  PROJECTS_SORT_FILTER_OPTIONS,
  PROJECTS_STATUS_FACET_OPTIONS,
  PROJECTS_VISIBILITY_FACET_OPTIONS,
  projectsFacetOptionsWithIcons,
} from "@/components/data-table/facet-options/projects-facet-options";
import { cn } from "@/lib/utils";
import {
  countProjectsByStatus,
  countProjectsByVisibility,
  type ProjectsSort,
  type ProjectsStatusFilter,
  type ProjectsVisibilityFilter,
} from "@/module/projects/projects.filter.projects";

type ProjectsListFiltersProps = {
  projects: ProjectOutput[];
  status: ProjectsStatusFilter[];
  visibility: ProjectsVisibilityFilter[];
  sort: ProjectsSort;
  onStatusChange: (value: ProjectsStatusFilter[]) => void | Promise<void>;
  onVisibilityChange: (
    value: ProjectsVisibilityFilter[],
  ) => void | Promise<void>;
  onSortChange: (value: ProjectsSort) => void | Promise<void>;
  onClear: () => void;
  filtersActive: boolean;
  tableLoading?: boolean;
  onFilterApplyingChange?: (isApplying: boolean) => void;
  getStatusResultCount?: (next: ProjectsStatusFilter[]) => number | undefined;
  getVisibilityResultCount?: (
    next: ProjectsVisibilityFilter[],
  ) => number | undefined;
};

export function ProjectsListFiltersBar({
  projects,
  status,
  visibility,
  sort,
  onStatusChange,
  onVisibilityChange,
  onSortChange,
  onClear,
  filtersActive,
  tableLoading = false,
  onFilterApplyingChange,
  getStatusResultCount,
  getVisibilityResultCount,
}: ProjectsListFiltersProps) {
  const statusCounts = countProjectsByStatus(projects);
  const visibilityCounts = countProjectsByVisibility(projects);

  const statusOptions = projectsFacetOptionsWithIcons(
    PROJECTS_STATUS_FACET_OPTIONS,
  ).map((option) => ({
    ...option,
    count: statusCounts[option.value],
  }));

  const visibilityOptions = projectsFacetOptionsWithIcons(
    PROJECTS_VISIBILITY_FACET_OPTIONS,
  ).map((option) => ({
    ...option,
    count: visibilityCounts[option.value],
  }));

  return (
    <div className={cn("flex flex-wrap items-center", layoutGapClass)}>
      <DataTableFacetedFilter<ProjectsStatusFilter>
        title="Status"
        filterIcon="statusActive"
        ariaLabel="Filter by status"
        value={status}
        onValueChange={onStatusChange}
        options={statusOptions}
        disabled={tableLoading}
        onApplyingChange={onFilterApplyingChange}
        getResultCount={getStatusResultCount}
      />
      <DataTableFacetedFilter<ProjectsVisibilityFilter>
        title="Visibility"
        filterIcon="globe"
        ariaLabel="Filter by visibility"
        value={visibility}
        onValueChange={onVisibilityChange}
        options={visibilityOptions}
        disabled={tableLoading}
        onApplyingChange={onFilterApplyingChange}
        getResultCount={getVisibilityResultCount}
      />
      <DataTableFilterSelect
        value={sort}
        onValueChange={(next) => void onSortChange(next as ProjectsSort)}
        options={PROJECTS_SORT_FILTER_OPTIONS}
        triggerIcon="calendar"
        placeholder="Sort"
        ariaLabel="Sort projects"
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
