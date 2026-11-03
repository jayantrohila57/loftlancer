/** Product reset stub. */
export function useOrganizationFavorites() {
  return {
    favorites: [] as string[],
    toggleFavorite: (_id: string) => undefined,
    isFavorite: (_id: string) => false,
  };
}
