import {
  layoutGapClass,
  layoutPageHeaderRowClass,
  layoutRowClass,
} from "./layout-spacing";
import { cn } from "./utils";

/**
 * Single size/spacing scale for every in-app page header (studio PageHeader,
 * auth + org SettingsFrame). Header and skeleton share these so loading never
 * shifts layout.
 */
export const pageHeaderRootClass = cn(
  "flex w-full min-w-0 flex-col",
  layoutGapClass,
);

/** Top row when title + optional back/actions share one line (no description). */
export const pageHeaderTopRowClass = layoutPageHeaderRowClass;

export const pageHeaderBackClass = cn("size-8 shrink-0", layoutRowClass);

export const pageHeaderTitleRowClass = cn(
  "flex min-w-0 flex-wrap items-center gap-2",
  layoutRowClass,
);

export const pageHeaderTitleClass =
  "truncate font-semibold text-lg leading-tight tracking-tight sm:text-xl";

export const pageHeaderDescriptionClass =
  "min-w-0 max-w-[65ch] text-muted-foreground text-xs leading-4";

export const pageHeaderActionsClass = cn(
  "flex shrink-0 items-center justify-end gap-2",
  layoutRowClass,
);

/** Fixed height even when empty; indent only when a back column is present. */
export const pageHeaderMetaRowBaseClass =
  "flex h-6 min-w-0 items-center gap-2 overflow-hidden text-muted-foreground text-xs";

/** Back (size-8) + gap-2 — lines meta up with the title column. */
export const pageHeaderMetaRowIndentClass = "ps-10";

export function pageHeaderMetaRowClass(hasBackColumn: boolean) {
  return cn(
    pageHeaderMetaRowBaseClass,
    hasBackColumn && pageHeaderMetaRowIndentClass,
  );
}

export const pageHeaderTabsRowClass =
  "flex min-h-9 h-auto w-full min-w-0 items-end justify-between gap-2 border-b";

export const pageHeaderTabsListClass = "-mb-px flex min-w-0 items-end gap-1";

export const pageHeaderTabClass =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4";

export const pageHeaderTabActiveClass = "border-foreground text-foreground";

export const pageHeaderTabInactiveClass =
  "border-transparent text-muted-foreground hover:text-foreground";

export const pageHeaderTabsEndClass =
  "flex h-9 shrink-0 items-center gap-2 pb-0.5";

/** Grid shell for title + description + actions (primary action stays on the title row). */
export const pageHeaderDescriptionGridClass = cn(
  "grid w-full min-w-0 gap-y-2 py-0.5",
  layoutGapClass,
);
