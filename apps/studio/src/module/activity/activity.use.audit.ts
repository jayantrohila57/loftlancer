"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { trpc } from "@/utils/trpc";

interface AuditFilters {
  projectId?: string;
  environmentId?: string;
  action?: "CREATE" | "UPDATE" | "DELETE" | "BULK_IMPORT" | "EXPORT";
  entityType?: "VARIABLE" | "ENVIRONMENT" | "PROJECT";
  search?: string;
}

export function useAudit(filters: AuditFilters = {}) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const auditLogsQuery = useQuery(
    trpc.auditLogs.list.queryOptions({
      projectId: filters.projectId,
      environmentId: filters.environmentId,
      action: filters.action,
      entityType: filters.entityType,
      search: filters.search,
      limit: 50,
      offset: 0,
    }),
  );

  const projectsQuery = useQuery(trpc.projects.list.queryOptions());

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const status: "loading" | "error" | "empty" | "success" =
    auditLogsQuery.isLoading
      ? "loading"
      : auditLogsQuery.isError
        ? "error"
        : auditLogsQuery.data?.data.length === 0
          ? "empty"
          : "success";

  return {
    logs: auditLogsQuery.data?.data ?? [],
    projects: projectsQuery.data?.data ?? [],
    isProjectsLoading: projectsQuery.isLoading,
    isFetching: auditLogsQuery.isFetching,
    status,
    error: auditLogsQuery.error,
    refetch: auditLogsQuery.refetch,
    revealedIds,
    toggleReveal,
  };
}
