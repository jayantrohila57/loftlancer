/**
 * Canonical layout spacing for Loftlancer UI apps (coss / shadcn sidebar scale).
 *
 * Documented in `docs/DESIGN_SYSTEM.md` (Spacing) and `docs/REDESIGN.md`.
 */

/** Inset padding (gutter) — SidebarHeader / SidebarGroup */
export const layoutGutterClass = "p-2";

/**
 * Dashboard inset horizontal padding — aligns header and scrollable main.
 * Only use via `layoutChromeClass`, `layoutDashboardScrollClass`, or marketing/sign-in shells.
 */
export const layoutInsetXClass = "px-4 md:px-4";

/** Vertical gap between dashboard page blocks (title → stats → body). */
export const layoutDashboardSectionGapClass = "gap-4";

/** Top padding on the dashboard scroll region below the sticky header. */
export const layoutDashboardScrollTopClass = "pt-4";

/** Full-width content inside the dashboard inset (header + main share this width). */
export const layoutInsetContainerWideClass =
  "mx-auto w-full min-w-0 max-w-[1600px]";
export const layoutInsetContainerNarrowClass = layoutInsetContainerWideClass;

/** Centered marketing site column (public landing only). */
export const marketingContainerClass = "mx-auto w-full max-w-6xl px-4 md:px-6";

/** Default flex gap between blocks — SidebarContent */
export const layoutGapClass = "gap-2";

/** Tight gap — SidebarMenu */
export const layoutMenuGapClass = "gap-1";

/** Default control row height — SidebarMenuButton */
export const layoutRowClass = "h-8";

/** Primary chrome row — SidebarMenuButton `lg` / team switcher */
export const layoutRowLgClass = "h-12";

/** Page / section vertical stack */
export const layoutSectionStackClass = `flex min-w-0 flex-col ${layoutGapClass}`;

/** Main scrollable content (dashboard shell) */
export const layoutContentClass = `flex flex-1 min-w-0 flex-col ${layoutGapClass} ${layoutGutterClass}`;

/** Scrollable dashboard main below the inset header (single scroll container) */
export const layoutDashboardScrollClass = `flex min-h-0 flex-1 min-w-0 flex-col ${layoutDashboardSectionGapClass} overflow-x-hidden overflow-y-auto overscroll-y-contain ${layoutDashboardScrollTopClass} pb-2 [scrollbar-gutter:stable] ${layoutInsetXClass}`;

/** Vertical rhythm for dashboard page sections (title → stats → body) */
export const layoutDashboardPageStackClass = `flex min-w-0 flex-col ${layoutDashboardSectionGapClass}`;

/** Fixed inset header shell — matches SidebarHeader vertical rhythm */
export const layoutChromeClass = `flex shrink-0 flex-col ${layoutGapClass} py-2 [scrollbar-gutter:stable] ${layoutInsetXClass}`;

/** Inner row aligned to sidebar team switcher */
export const layoutChromeRowClass = `flex w-full min-w-0 items-center justify-between ${layoutRowLgClass} ${layoutGapClass}`;

/** In-page title row — grows with title, badges, and clamped description */
export const layoutPageHeaderRowClass =
  "flex w-full min-w-0 items-center justify-between gap-2 min-h-12 py-0.5";

/** In-page title row (DashboardSection, page heroes) */
export const layoutTitleRowClass = layoutPageHeaderRowClass;

/** Form / sheet field stacks */
export const layoutFormStackClass = `grid ${layoutGapClass}`;

/** Toolbar row above tables / filters */
export const layoutToolbarClass = `flex flex-col sm:flex-row ${layoutGapClass}`;

/** Group label typography — SidebarGroupLabel */
export const layoutGroupLabelClass =
  "flex h-8 shrink-0 items-center px-2 font-medium text-xs";

/** Page title typography — primary in-page heading */
export const layoutPageTitleClass =
  "font-semibold text-lg leading-tight tracking-tight sm:text-xl";
