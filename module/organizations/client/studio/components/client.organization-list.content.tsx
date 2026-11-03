"use client";

import { DataTableToolbar } from "@features/data-table/core/client/data-table.toolbar";
import { EmptyState } from "@features/patterns/core/client/patterns.empty-state";
import { SearchableCombobox } from "@features/patterns/core/client/patterns.searchable-combobox";
import { useMemo, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { ErrorState } from "@/components/patterns/error-state";
import { appIcons } from "@/lib/icons";
import type { OrganizationListOutput } from "../../../utils/validation/utils.organization-list.validation";
import { useOrganizationFavorites } from "../hooks/client.use-organization-favorites.hook";
import { useOrganizationList } from "../hooks/client.use-organization-list.hook";
import { OrganizationListSkeleton } from "../skeletons/client.organization-skeleton";
import { OrganizationCard } from "./client.organization-card";

export function OrganizationListContent() {
  const { orgs: metadataOrgs, activeOrganizationId } = useActiveOrganization();
  const listQuery = useOrganizationList();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const { favorites, toggleFavorite, favoriteLimit } =
    useOrganizationFavorites();

  const organizations = useMemo(() => {
    const metadataById = new Map(metadataOrgs.map((org) => [org.id, org]));
    const listData =
      listQuery.data?.status === "success" &&
      !Array.isArray(listQuery.data.data)
        ? listQuery.data.data
        : null;
    const items: OrganizationListOutput["items"] = listData?.items ?? [];
    return items.map((org) => ({ ...metadataById.get(org.id), ...org }));
  }, [listQuery.data, metadataOrgs]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return organizations
      .filter(
        (org) =>
          !query ||
          org.name.toLocaleLowerCase().includes(query) ||
          org.slug.toLocaleLowerCase().includes(query),
      )
      .sort((a, b) => {
        if (sort === "current")
          return (
            Number(b.id === activeOrganizationId) -
              Number(a.id === activeOrganizationId) ||
            a.name.localeCompare(b.name)
          );
        if (sort === "favorites")
          return (
            Number(favorites.includes(b.id)) -
              Number(favorites.includes(a.id)) || a.name.localeCompare(b.name)
          );
        return a.name.localeCompare(b.name);
      });
  }, [activeOrganizationId, favorites, organizations, search, sort]);

  if (listQuery.isPending) return <OrganizationListSkeleton />;
  if (listQuery.isError || listQuery.data?.status !== "success") {
    return (
      <ErrorState
        title="Organizations unavailable"
        description="Could not load your organizations. Try again."
        onRetry={() => void listQuery.refetch()}
      />
    );
  }
  if (organizations.length === 0) {
    return (
      <EmptyState
        icon={appIcons.organization}
        title="No organizations yet"
        description="Create an organization to manage people, teams, and projects."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
