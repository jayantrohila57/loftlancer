"use client";

import { useCallback, useMemo, useState } from "react";
import { auditLogEmpty } from "@/components/data-table/data-table-empty-presets";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { AuditLogTableView } from "./activity.audit.log.table.view";
import { useAudit } from "./activity.use.audit";

const ALL_PROJECTS = "__all__" as const;
type ProjectFilterValue = typeof ALL_PROJECTS | string;

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] =
    useState<ProjectFilterValue>(ALL_PROJECTS);
  const [filterApplying, setFilterApplying] = useState(false);

  const {
    logs,
    projects,
    status,
    error,
    revealedIds,
    toggleReveal,
    refetch,
    isFetching,
  } = useAudit({
    search: searchTerm,
    projectId:
      selectedProjectId === ALL_PROJECTS ? undefined : selectedProjectId,
  });

  const filterActive =
    Boolean(searchTerm.trim()) || selectedProjectId !== ALL_PROJECTS;

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedProjectId(ALL_PROJECTS);
  }, []);

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: project.name,
        icon: (
          <AppIcon
            name="projectFolder"
            className="size-4 text-muted-foreground"
          />
        ),
      })),
    [projects],
  );

  const projectFilter = (
    <DataTableFacetedFilter<ProjectFilterValue>
      title="Project"
      filterIcon="projectFolder"
      ariaLabel="Filter by project"
      multiple={false}
      isLoading={status === "loading" && projects.length === 0}
      disabled={filterApplying || isFetching}
      value={selectedProjectId === ALL_PROJECTS ? [] : [selectedProjectId]}
      badgeCount={selectedProjectId === ALL_PROJECTS ? 0 : 1}
      onApplyingChange={setFilterApplying}
      refetch={refetch}
      getResultCount={() => logs.length}
      onValueChange={async (next) => {
        setSelectedProjectId(next[0] ?? ALL_PROJECTS);
      }}
      options={[
        {
          value: ALL_PROJECTS,
          label: "All projects",
          icon: (
            <AppIcon name="project" className="size-4 text-muted-foreground" />
          ),
        },
        ...projectOptions,
      ]}
    />
  );

  if (status === "error") {
    return (
      <ErrorState
        title="Failed to load activity"
        description={
          error?.message ?? "We could not load the audit log. Please try again."
        }
        onRetry={() => void refetch()}
      />
    );
  }

  const tableLoading = status === "loading" || isFetching || filterApplying;

  return (
    <AuditLogTableView
      logs={logs}
      isLoading={tableLoading}
      revealedIds={revealedIds}
      onToggleReveal={toggleReveal}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filter={projectFilter}
      filterActive={filterActive}
      empty={auditLogEmpty(clearFilters)}
    />
  );
}
