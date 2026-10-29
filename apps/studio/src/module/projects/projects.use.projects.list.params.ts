"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useDebouncedUrlParam } from "@/hooks/use-debounced-url-param";
import type {
  ProjectsSort,
  ProjectsStatusFilter,
  ProjectsVisibilityFilter,
} from "@/module/projects/projects.filter.projects";
import { parseListUrlParam } from "@/module/projects/projects.parse.list.url.param";

const VIEW_STORAGE_KEY = "loftlancer-projects-view";

export type ProjectsViewMode = "grid" | "list";

const STATUS_VALUES = new Set<ProjectsStatusFilter>([
  "active",
  "inactive",
  "maintenance",
  "archived",
]);

const VISIBILITY_VALUES = new Set<ProjectsVisibilityFilter>([
  "public",
  "private",
]);

function readStoredView(): ProjectsViewMode {
  if (typeof window === "undefined") return "list";
  const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
  return stored === "grid" ? "grid" : "list";
}

function parseSort(value: string | null): ProjectsSort {
  if (
    value === "updated-asc" ||
    value === "name-asc" ||
    value === "name-desc"
  ) {
    return value;
  }
  return "updated-desc";
}

function parseView(value: string | null): ProjectsViewMode {
  if (value === "grid" || value === "list") return value;
  return readStoredView();
}

export function useProjectsListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("q") ?? "";
  const status = parseListUrlParam(searchParams.get("status"), STATUS_VALUES);
  const visibility = parseListUrlParam(
    searchParams.get("visibility"),
    VISIBILITY_VALUES,
  );
  const sort = parseSort(searchParams.get("sort"));
  const view = parseView(searchParams.get("view"));

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      mutate(params);
      const query = params.toString();
      router.replace((query ? `${pathname}?${query}` : pathname) as Route);
    },
    [pathname, router],
  );

  const commitSearch = useCallback(
    (value: string) => {
      replaceParams((params) => {
        if (value.trim()) params.set("q", value);
        else params.delete("q");
      });
    },
    [replaceParams],
  );

  const [search, setSearch] = useDebouncedUrlParam(urlSearch, commitSearch);

  const setStatus = useCallback(
    (value: ProjectsStatusFilter[]) => {
      replaceParams((params) => {
        if (value.length === 0) params.delete("status");
        else params.set("status", value.join(","));
      });
    },
    [replaceParams],
  );

  const setVisibility = useCallback(
    (value: ProjectsVisibilityFilter[]) => {
      replaceParams((params) => {
        if (value.length === 0) params.delete("visibility");
        else params.set("visibility", value.join(","));
      });
    },
    [replaceParams],
  );

  const setSort = useCallback(
    (value: ProjectsSort) => {
      replaceParams((params) => {
        if (value === "updated-desc") params.delete("sort");
        else params.set("sort", value);
      });
    },
    [replaceParams],
  );

  const setView = useCallback(
    (value: ProjectsViewMode) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(VIEW_STORAGE_KEY, value);
      }
      replaceParams((params) => {
        params.set("view", value);
      });
    },
    [replaceParams],
  );

  const clearFilters = useCallback(() => {
    replaceParams((params) => {
      params.delete("q");
      params.delete("status");
      params.delete("visibility");
      params.delete("sort");
    });
  }, [replaceParams]);

  const filtersActive = useMemo(
    () =>
      Boolean(search.trim()) ||
      status.length > 0 ||
      visibility.length > 0 ||
      sort !== "updated-desc",
    [search, sort, status, visibility],
  );

  return {
    search,
    status,
    visibility,
    sort,
    view,
    setSearch,
    setStatus,
    setVisibility,
    setSort,
    setView,
    clearFilters,
    filtersActive,
  };
}
