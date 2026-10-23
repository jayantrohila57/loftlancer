"use client";

import { DataTableToolbar } from "@loftlancer/ui/data-table/data-table-toolbar";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useOrganizationFavorites } from "@/components/org/use-organization-favorites";
import { appIcons } from "@/lib/icons";
import { trpc } from "@/utils/trpc";
import { OrganizationCard } from "./organization-card";
import { OrganizationsListBodySkeleton } from "./skeletons";

export function OrganizationsListContent() {
  const { orgs, activeOrganizationId } = useActiveOrganization();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
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
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return orgsWithLifecycle
      .filter(
        (org) =>
          !query ||
          org.name.toLocaleLowerCase().includes(query) ||
          org.slug.toLocaleLowerCase().includes(query),
      )
      .sort((a, b) => {
        if (sort === "current") {
          return (
            Number(b.id === activeOrganizationId) -
              Number(a.id === activeOrganizationId) ||
            a.name.localeCompare(b.name)
          );
        }
        if (sort === "favorites") {
          return (
            Number(favorites.includes(b.id)) -
              Number(favorites.includes(a.id)) || a.name.localeCompare(b.name)
          );
        }
        return a.name.localeCompare(b.name);
      });
  }, [activeOrganizationId, favorites, orgsWithLifecycle, search, sort]);

  if (lifecycleQuery.isPending) return <OrganizationsListBodySkeleton />;

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchPlaceholder="Search organizations…"
        searchValue={search}
        onSearchChange={setSearch}
        filter={
          <SearchableCombobox
            value={sort}
            onChange={setSort}
            ariaLabel="Sort organizations"
            className="w-44"
            options={[
              { value: "name", label: "Name A–Z" },
              { value: "favorites", label: "Favorites first" },
              { value: "current", label: "Current first" },
            ]}
          />
        }
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={appIcons.organization}
          title="No matching organizations"
          description="Try another name or organization address."
        />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((org) => (
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
      )}
    </div>
  );
}
