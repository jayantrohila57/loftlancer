"use client";

import { useQuery } from "@tanstack/react-query";
import { studioORPC } from "@/lib/orpc";

const organizationListKey = ["organizations", "list"] as const;

export function useOrganizationList() {
  return useQuery({
    queryKey: organizationListKey,
    queryFn: () => studioORPC.organizations.list({}),
    staleTime: 30_000,
    meta: { toastOnError: false },
  });
}
