"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useDebouncedUrlParam } from "@/hooks/use-debounced-url-param";
import type {
  OrganizationsSort,
  OrganizationsTypeFilter,
} from "@/module/organizations/organizations.filter.organizations";

function parseType(value: string | null): OrganizationsTypeFilter {
  if (value === "personal" || value === "team") return value;
  return "all";
}

function parseSort(value: string | null): OrganizationsSort {
  if (value === "name-desc" || value === "slug-asc") return value;
  return "name-asc";
}

export function useOrganizationsListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("q") ?? "";
  const type = parseType(searchParams.get("type"));
  const sort = parseSort(searchParams.get("sort"));

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

  const setType = useCallback(
    (value: OrganizationsTypeFilter) => {
      replaceParams((params) => {
        if (value === "all") params.delete("type");
        else params.set("type", value);
      });
    },
    [replaceParams],
  );

  const setSort = useCallback(
    (value: OrganizationsSort) => {
      replaceParams((params) => {
        if (value === "name-asc") params.delete("sort");
        else params.set("sort", value);
      });
    },
    [replaceParams],
  );

  const clearFilters = useCallback(() => {
    replaceParams((params) => {
      params.delete("q");
      params.delete("type");
      params.delete("sort");
      params.delete("view");
    });
  }, [replaceParams]);

  const filtersActive = useMemo(
    () => Boolean(search.trim()) || type !== "all" || sort !== "name-asc",
    [search, sort, type],
  );

  return {
    search,
    type,
    sort,
    setSearch,
    setType,
    setSort,
    clearFilters,
    filtersActive,
  };
}
