"use client";

import { useQuery } from "@tanstack/react-query";
import { studioORPC } from "@/lib/orpc";

export function useMyOrganizationInvitations() {
  return useQuery({
    queryKey: ["organizations", "my-invitations"],
    queryFn: () => studioORPC.organizations.myInvitations({}),
    staleTime: 30_000,
    meta: { toastOnError: false },
  });
}
