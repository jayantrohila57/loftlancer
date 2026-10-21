"use client";

import { DataTableToolbar } from "@loftlancer/ui/data-table/data-table-toolbar";
import { layoutSectionStackClass } from "@loftlancer/ui/layout-spacing";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import DashboardSection from "@/components/section-dashboard";
import { ProjectsListFiltersBar } from "./projects-list-filters";
import { ProjectsTableView } from "./projects-table-view";
import { ProjectsViewToggle } from "./projects-view-toggle";

const noop = () => {};

/**
 * Projects list body while loading. Mirrors ProjectsListContent 1:1 (#326):
 * the same toolbar (search, filters, view toggle; disabled) and the real
 * projects table columns, with skeleton rows only in the body. No extra
 * "Actions" header, no group heading.
 */
export function ProjectsSkeleton() {
  return (
    <div
      className={layoutSectionStackClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <DataTableToolbar
        searchPlaceholder="Search projects…"
        searchValue=""
        onSearchChange={noop}
        filter={
          <ProjectsListFiltersBar
            projects={[]}
            status={[]}
            visibility={[]}
            sort="updated-desc"
            onStatusChange={noop}
            onVisibilityChange={noop}
            onSortChange={noop}
            onClear={noop}
            filtersActive={false}
            tableLoading
          />
        }
        trailing={<ProjectsViewToggle view="list" onViewChange={noop} />}
      />
      <ProjectsTableView
        projects={[]}
        isLoading
        caption="All projects"
        captionSrOnly
        searchable={false}
      />
    </div>
  );
}

/** Whole projects page while the route loads: same header and body. */
export function ProjectsPageSkeleton() {
  return (
    <DashboardSection
      title="Projects"
      description="All workspace projects in one searchable list."
      back={false}
      hideTabs
      action={<PageHeaderActionButton label="New project" disabled />}
    >
      <ProjectsSkeleton />
    </DashboardSection>
  );
}
