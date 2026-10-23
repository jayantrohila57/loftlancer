"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import type { DataTableEmptyConfig } from "@loftlancer/ui/data-table/data-table-empty-types";
import { useMemo } from "react";
import { projectsTableEmpty } from "@/components/data-table/data-table-empty-presets";
import { AppIcon } from "@/components/patterns/app-icon";
import { useOrgSlug } from "@/utils/use-route-scope";
import { createProjectsTableColumns } from "./projects-table-columns";

interface ProjectsTableViewProps {
  projects: ProjectOutput[];
  isLoading?: boolean;
  caption?: string;
  searchable?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  limitRows?: number;
  captionSrOnly?: boolean;
  empty?: DataTableEmptyConfig;
  onCreateProject?: () => void;
  filterActive?: boolean;
  showLinksColumn?: boolean;
}

export function ProjectsTableView({
  projects,
  isLoading,
  caption,
  searchable = true,
  enablePagination = true,
  pageSize = 10,
  limitRows,
  captionSrOnly,
  empty,
  onCreateProject,
  filterActive = false,
  showLinksColumn,
}: ProjectsTableViewProps) {
  const org = useOrgSlug();
  const showLinks =
    showLinksColumn ??
    projects.some((project) =>
      Boolean(project.repositoryUrl || project.websiteUrl),
    );
  const columns = useMemo(
    () => createProjectsTableColumns(org, showLinks),
    [org, showLinks],
  );
  const data = limitRows ? projects.slice(0, limitRows) : projects;

  const emptyConfig =
    empty ??
    projectsTableEmpty(
      onCreateProject ? (
        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={onCreateProject}
        >
          <AppIcon name="plus" className="text-current" />
          New project
        </Button>
      ) : undefined,
    );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      empty={emptyConfig}
      caption={caption}
      captionSrOnly={captionSrOnly}
      framed
      compactLayout
      searchable={searchable}
      filterActive={filterActive}
      searchPlaceholder="Search projects…"
      enablePagination={enablePagination && !limitRows}
      pageSize={pageSize}
    />
  );
}
