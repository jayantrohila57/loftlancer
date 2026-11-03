"use client";

import { useCallback, useEffect, useState } from "react";

const MAX_FAVORITES = 3;
const STORAGE_KEY = "loftlancer-studio-organization-favorites";
const CHANGE_EVENT = "loftlancer-organization-favorites-change";

function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(value)
      ? value
          .filter((id): id is string => typeof id === "string")
          .slice(0, MAX_FAVORITES)
      : [];
  } catch {
    return [];
  }
}

export function useOrganizationFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    setFavorites(readFavorites());
    const syncStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setFavorites(readFavorites());
    };
    const syncTab = () => setFavorites(readFavorites());
    window.addEventListener("storage", syncStorage);
    window.addEventListener(CHANGE_EVENT, syncTab);
    return () => {
      window.removeEventListener("storage", syncStorage);
      window.removeEventListener(CHANGE_EVENT, syncTab);
    };
  }, []);
  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    if (!current.includes(id) && current.length >= MAX_FAVORITES) return false;
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setFavorites(next);
    return true;
  }, []);
  return { favorites, toggleFavorite, favoriteLimit: MAX_FAVORITES };
}
