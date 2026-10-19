export const MAX_SIDEBAR_FAVORITES = 3;

export function canAddSidebarFavorite(
  currentCount: number,
  alreadyPinned: boolean,
) {
  return alreadyPinned || currentCount < MAX_SIDEBAR_FAVORITES;
}
