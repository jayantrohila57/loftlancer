"use client";

import { useCallback, useEffect, useState } from "react";

export const MAX_ORGANIZATION_FAVORITES = 3;
const STORAGE_KEY = "loftlancer-studio-organization-favorites";
const CHANGE_EVENT = "loftlancer-organization-favorites-change";

export function toggleOrganizationFavorite(
  favorites: string[],
  organizationId: string,
): string[] | null {
  const exists = favorites.includes(organizationId);
  if (!exists && favorites.length >= MAX_ORGANIZATION_FAVORITES) return null;
  return exists
    ? favorites.filter((id) => id !== organizationId)
    : [...favorites, organizationId];
}
function readFavorites(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value
          .filter((id): id is string => typeof id === "string")
          .slice(0, MAX_ORGANIZATION_FAVORITES)
      : [];
  } catch {
    return [];
  }
}

export function useOrganizationFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setFavorites(readFavorites());
      }
    };
    const syncInTab = () => setFavorites(readFavorites());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, syncInTab);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, syncInTab);
    };
  }, []);

  const toggleFavorite = useCallback((organizationId: string) => {
    const current = readFavorites();
    const next = toggleOrganizationFavorite(current, organizationId);
    if (!next) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setFavorites(next);
    return true;
  }, []);

  const retainOrganizations = useCallback((organizationIds: string[]) => {
    const allowed = new Set(organizationIds);
    const current = readFavorites();
    const next = current.filter((id) => allowed.has(id));
    if (next.length === current.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setFavorites(next);
  }, []);

  return {
    favorites,
    toggleFavorite,
    retainOrganizations,
    favoriteLimit: MAX_ORGANIZATION_FAVORITES,
  };
}
