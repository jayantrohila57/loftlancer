"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type OrgListItem,
  useActiveOrganization,
} from "@/components/org/active-organization-context";
import { authClient } from "@/lib/auth-client";
import { isBenignClientError } from "@/lib/errors/client-errors";
import { countPendingInvitations } from "@/lib/organization-invitations";
import { useOrganizationIdentity } from "@/module/organizations/organizations.organization.identity.context";

export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: string | Record<string, unknown> | null;
  createdAt?: Date | string;
  memberCount?: number;
  invitationCount?: number;
};

type LoadStatus = "loading" | "success" | "error" | "not-found";

export function useOrganizationBySlug(
  slug: string,
  initialOrganization?: Pick<OrganizationDetail, "id" | "name" | "slug">,
) {
  const contextOrganization = useOrganizationIdentity();
  const organizationIdentity = initialOrganization ?? contextOrganization;
  const {
    orgs,
    initialLoadDone,
    refreshOrganizations,
    setActiveOrganization,
    activeOrganizationId,
  } = useActiveOrganization();
  const hasInitialOrganization = organizationIdentity?.slug === slug;
  const [organization, setOrganization] = useState<OrganizationDetail | null>(
    hasInitialOrganization ? organizationIdentity : null,
  );
  const [status, setStatus] = useState<LoadStatus>(
    hasInitialOrganization ? "success" : "loading",
  );
  const [error, setError] = useState<Error | null>(null);

  const listItem = orgs.find((o) => o.slug === slug) as OrgListItem | undefined;

  const load = useCallback(async () => {
    if (!hasInitialOrganization) setStatus("loading");
    setError(null);
    try {
      const result = await authClient.organization.getFullOrganization({
        query: { organizationSlug: slug },
      });
      if (!result.data) {
        if (hasInitialOrganization) {
          setStatus("success");
          return;
        }
        setOrganization(null);
        setStatus("not-found");
        return;
      }
      const data = result.data;
      const members = (data as { members?: unknown[] }).members;
      const invitations = (data as { invitations?: { status?: string }[] })
        .invitations;
      const pendingInvites = Array.isArray(invitations)
        ? countPendingInvitations(invitations)
        : undefined;

      setOrganization({
        id: data.id,
        name: data.name,
        slug: data.slug,
        logo: (data as { logo?: string | null }).logo ?? null,
        metadata: data.metadata ?? null,
        createdAt: data.createdAt,
        memberCount: Array.isArray(members) ? members.length : undefined,
        invitationCount: pendingInvites,
      });
      setStatus("success");
    } catch (err) {
      if (isBenignClientError(err)) {
        return;
      }
      setError(err instanceof Error ? err : new Error("Failed to load"));
      setStatus(hasInitialOrganization ? "success" : "error");
    }
  }, [hasInitialOrganization, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    // Wait for the org list so a still-null active id doesn't trigger a full
    // org switch (setActive + invalidate + router.refresh) on every direct load.
    if (status !== "success" || !organization?.id || !initialLoadDone) {
      return;
    }
    const isMember = orgs.some((o) => o.id === organization.id);
    if (!isMember) {
      return;
    }
    if (organization.id !== activeOrganizationId) {
      void setActiveOrganization(organization.id);
    }
  }, [
    activeOrganizationId,
    initialLoadDone,
    organization?.id,
    orgs,
    setActiveOrganization,
    status,
  ]);

  return {
    organization,
    listItem,
    status,
    error,
    reload: load,
    refreshOrganizations,
  };
}
