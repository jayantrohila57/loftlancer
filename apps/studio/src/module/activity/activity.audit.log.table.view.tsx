"use client";

import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import type { DataTableEmptyConfig } from "@loftlancer/ui/data-table/data-table-empty-types";
import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { ReactNode } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  AuditActionBadge,
  AuditEntityBadge,
} from "@/components/patterns/status-badge";

interface AuditLog {
  id: string;
  createdAt: string | Date;
  action: string;
  entityType: string;
  variableId?: string | null;
  environmentId?: string | null;
  projectId?: string | null;
  oldValue: string | null;
  newValue: string | null;
}

interface AuditLogTableViewProps {
  logs: AuditLog[];
  isLoading?: boolean;
  revealedIds: Set<string>;
  onToggleReveal: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filter?: ReactNode;
  filterActive?: boolean;
  empty?: DataTableEmptyConfig;
}

const getEntityDescription = (log: AuditLog) => {
  if (log.variableId) return `Variable: ${log.variableId.slice(0, 8)}...`;
  if (log.environmentId)
    return `Environment: ${log.environmentId.slice(0, 8)}...`;
  if (log.projectId) return `Project: ${log.projectId.slice(0, 8)}...`;
  return "System operation";
};

const columnHelper = legacyCreateColumnHelper<AuditLog>();

export function AuditLogTableView({
  logs,
  isLoading = false,
  revealedIds,
  onToggleReveal,
  searchValue,
  onSearchChange,
  filter,
  filterActive = false,
  empty,
}: AuditLogTableViewProps) {
  const columns: import("@loftlancer/ui/data-table/data-table").DataTableColumnDef<AuditLog>[] =
    [
      columnHelper.accessor("createdAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">
            <LocalDateTime
              value={getValue()}
              options={LOCAL_DATE_TIME_FORMAT}
            />
          </span>
        ),
      }),
      columnHelper.accessor("action", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Action" />
        ),
        cell: ({ getValue }) => (
          <AuditActionBadge action={String(getValue())} />
        ),
      }),
      columnHelper.accessor("entityType", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Entity" />
        ),
        cell: ({ getValue }) => (
          <AuditEntityBadge entityType={String(getValue())} />
        ),
      }),
      columnHelper.display({
        id: "details",
        header: "Details",
        enableSorting: false,
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{getEntityDescription(log)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onToggleReveal(log.id)}
                aria-label={
                  revealedIds.has(log.id) ? "Hide details" : "Reveal details"
                }
              >
                <AppIcon
                  name={revealedIds.has(log.id) ? "hide" : "reveal"}
                  className="text-foreground"
                />
              </Button>
            </div>
          );
        },
      }),
    ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      isLoading={isLoading}
      caption="Audit log"
      framed
      searchPlaceholder="Search logs…"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      filter={filter}
      enablePagination
      pageSize={20}
      filterActive={filterActive}
      empty={empty}
      captionSrOnly
    />
  );
}
