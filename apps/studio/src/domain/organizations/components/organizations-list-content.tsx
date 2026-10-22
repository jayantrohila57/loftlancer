"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useOrganizationFavorites } from "@/components/org/use-organization-favorites";
import { trpc } from "@/utils/trpc";
import { OrganizationCard } from "./organization-card";
import { OrganizationsListBodySkeleton } from "./skeletons";

export function OrganizationsListContent() {
  const { orgs, activeOrganizationId } = useActiveOrganization();
  const { favorites, toggleFavorite, favoriteLimit } =
    useOrganizationFavorites();
  const lifecycleQuery = useQuery(trpc.organizations.list.queryOptions());

  const orgsWithLifecycle = useMemo(() => {
    const byId = new Map(
      (lifecycleQuery.data?.items ?? []).map((item) => [
        item.id,
        item.archivedAt,
      ]),
    );
    return orgs.map((org) => ({
      ...org,
      archivedAt: byId.get(org.id) ?? null,
    }));
  }, [lifecycleQuery.data?.items, orgs]);
  if (lifecycleQuery.isPending) return <OrganizationsListBodySkeleton />;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {orgsWithLifecycle.map((org) => (
        <OrganizationCard
          key={org.id}
          org={org}
          isActive={org.id === activeOrganizationId}
          isFavorite={favorites.includes(org.id)}
          onToggleFavorite={() => toggleFavorite(org.id)}
          favoriteLimitReached={favorites.length >= favoriteLimit}
        />
      ))}
    </div>
  );
}
