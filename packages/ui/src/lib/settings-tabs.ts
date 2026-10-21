export type SettingsTabRoute = {
  href: string;
  active?: boolean;
};

/** Resolve exactly one selected resource tab, honoring explicit grouped routes. */
export function resolveSettingsTabHref(
  pathname: string,
  tabs: readonly SettingsTabRoute[],
): string | undefined {
  const explicit = tabs
    .filter((tab) => tab.active)
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (explicit) return explicit.href;

  return tabs
    .filter(
      (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
