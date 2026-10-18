"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import { DataTableToolbar } from "@loftlancer/ui/data-table/data-table-toolbar";
import { layoutSectionStackClass } from "@loftlancer/ui/layout-spacing";
import { useCallback, useMemo, useState } from "react";
import { projectsTableEmpty } from "@/components/data-table/data-table-empty-presets";
import { runDataTableClearAllFilters } from "@/components/data-table/run-data-table-clear-all-filters";
import { AppIcon } from "@/components/patterns/app-icon";
import { FilteredListNoResultsEmpty } from "@/components/patterns/filtered-list-no-results-empty";
import { cn } from "@/lib/utils";
import { useProjectsListParams } from "../hooks/use-projects-list-params";
import {
  filterAndSortProjects,
  type ProjectsStatusFilter,
  type ProjectsVisibilityFilter,
} from "../lib/filter-projects";
import { ProjectsGridView } from "./projects-grid-view";
import { ProjectsListFiltersBar } from "./projects-list-filters";
import { ProjectsTableView } from "./projects-table-view";
import { ProjectsViewToggle } from "./projects-view-toggle";

type ProjectsListContentProps = {
  projects: ProjectOutput[];
  onCreateProject?: () => void;
};

export function ProjectsListContent({
  projects,
  onCreateProject,
}: ProjectsListContentProps) {
  const params = useProjectsListParams();
  const [filterTableLoading, setFilterTableLoading] = useState(false);

  const countForFilters = useCallback(
    (
      overrides: Partial<{
        status: ProjectsStatusFilter[];
        visibility: ProjectsVisibilityFilter[];
      }>,
    ) =>
      filterAndSortProjects(projects, {
        search: params.search,
        status: overrides.status ?? params.status,
        visibility: overrides.visibility ?? params.visibility,
        sort: params.sort,
      }).length,
    [params.search, params.sort, params.status, params.visibility, projects],
  );

  const getStatusResultCount = useCallback(
    (next: ProjectsStatusFilter[]) => countForFilters({ status: next }),
    [countForFilters],
  );

  const getVisibilityResultCount = useCallback(
    (next: ProjectsVisibilityFilter[]) => countForFilters({ visibility: next }),
    [countForFilters],
  );

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
      filterAndSortProjects(projects, {
        search: params.search,
        status: params.status,
        visibility: params.visibility,
        sort: params.sort,
      }),
    [params.search, params.sort, params.status, params.visibility, projects],
  );

  const newProjectButton = onCreateProject ? (
    <Button
      type="button"
      size="sm"
      className="gap-1.5"
      onClick={onCreateProject}
    >
      <AppIcon name="plus" className="text-current" />
      New project
    </Button>
  ) : null;

  const emptyNoResults = (
    <FilteredListNoResultsEmpty title="No matching projects" />
  );

  return (
    <div className={cn(layoutSectionStackClass)}>
      <DataTableToolbar
        searchPlaceholder="Search projects…"
        searchValue={params.search}
        onSearchChange={params.setSearch}
        filter={
          <ProjectsListFiltersBar
            projects={projects}
            status={params.status}
            visibility={params.visibility}
            sort={params.sort}
            onStatusChange={params.setStatus}
            onVisibilityChange={params.setVisibility}
            onSortChange={params.setSort}
            onClear={() => void handleClearAllFilters()}
            filtersActive={params.filtersActive}
            tableLoading={filterTableLoading}
            onFilterApplyingChange={setFilterTableLoading}
            getStatusResultCount={getStatusResultCount}
            getVisibilityResultCount={getVisibilityResultCount}
          />
        }
        trailing={
          <ProjectsViewToggle
            view={params.view}
            onViewChange={params.setView}
          />
        }
      />

      {filtered.length === 0 ? (
        params.filtersActive ? (
          emptyNoResults
        ) : null
      ) : params.view === "grid" ? (
        <ProjectsGridView projects={filtered} />
      ) : (
        <ProjectsTableView
          projects={filtered}
          caption="All projects"
          captionSrOnly
          searchable={false}
          isLoading={filterTableLoading}
          filterActive={params.filtersActive}
          onCreateProject={onCreateProject}
          empty={projectsTableEmpty(newProjectButton ?? undefined)}
        />
      )}
    </div>
  );
}
