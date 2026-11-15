import type { AppearancePreviewId } from "@features/form"

export const appearancePreviewAssets = {
  theme: {
    dark: "theme-dark",
    light: "theme-light",
    system: "theme-system",
  } satisfies Record<"dark" | "light" | "system", AppearancePreviewId>,
  zoom: {
    dense: "zoom-dense",
    default: "zoom-default",
    spacious: "zoom-spacious",
  } satisfies Record<"dense" | "default" | "spacious", AppearancePreviewId>,
  density: {
    compact: "density-compact",
    comfortable: "density-comfortable",
    default: "density-default",
  } satisfies Record<
    "compact" | "comfortable" | "default",
    AppearancePreviewId
  >,
  sidebar: {
    collapsed: "sidebar-collapsed",
    expanded: "sidebar-expanded",
    remember: "sidebar-remember",
  } satisfies Record<
    "collapsed" | "expanded" | "remember",
    AppearancePreviewId
  >,
} as const
