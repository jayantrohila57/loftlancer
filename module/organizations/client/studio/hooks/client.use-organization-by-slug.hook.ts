"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { studioORPC } from "@/lib/orpc";
import { organizationIdentityKey } from "../utils/client.organization-query-keys";

type OrganizationResponse = Awaited<
  ReturnType<typeof studioORPC.organizations.getBySlug>
>;

export function useOrganizationBySlug(
  slug: string,
  initialData?: OrganizationResponse,
) {
  const active = useActiveOrganization();
  const query = useQuery({
    queryKey: organizationIdentityKey(slug),
    queryFn: () => studioORPC.organizations.getBySlug({ slug }),
    initialData,
    staleTime: 30_000,
    meta: { toastOnError: false },
  });
  const response = query.data;
  const organization =
    response?.status === "success" && !Array.isArray(response.data)
      ? response.data
      : null;
  const status = query.isPending
    ? "loading"
    : query.isError
      ? "error"
      : response?.status === "failed" || response?.status === "error"
        ? "not-found"
        : "success";
  const listItem = active.orgs.find((item) => item.slug === slug);

  useEffect(() => {
    if (
      !organization?.id ||
      !active.initialLoadDone ||
      organization.id === active.activeOrganizationId
    )
      return;
    if (active.orgs.some((item) => item.id === organization.id)) {
      void active.setActiveOrganization(organization.id);
    }
  }, [
    active.activeOrganizationId,
    active.initialLoadDone,
    active.orgs,
    active.setActiveOrganization,
    organization?.id,
  ]);

  return {
    ...query,
    organization,
    listItem,
    status,
    error: query.error,
    reload: query.refetch,
    refreshOrganizations: active.refreshOrganizations,
  };
}
