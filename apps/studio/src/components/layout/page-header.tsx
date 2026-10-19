"use client";

import {
  pageHeaderDescriptionGridClass,
  pageHeaderMetaRowClass,
  pageHeaderRootClass,
  pageHeaderTabsRowClass,
  pageHeaderTopRowClass,
} from "@loftlancer/ui/page-header-classes";
import {
  pageHeaderDescriptionGridActionClass,
  pageHeaderDescriptionGridDescClass,
  pageHeaderDescriptionGridTitleClass,
} from "@loftlancer/ui/page-header-grid-classes";
import {
  PageHeaderLayout,
  PageHeaderTabsRow,
} from "@loftlancer/ui/patterns/page-header";
import { Skeleton } from "@loftlancer/ui/skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageBackButton } from "@/components/layout/page-back-button";
import {
  getPageBackFallback,
  getPageBackHref,
  type PageBackHref,
} from "@/lib/page-back";
import { cn } from "@/lib/utils";

/**
 * Back is always rendered. `false` and `"auto"` both resolve to the logical
 * parent route (or history back with a parent fallback); a string or object
 * pins the target.
 */
export type PageHeaderBackProp =
  | false
  | "auto"
  | PageBackHref
  | { href?: PageBackHref | null; useHistory?: boolean };

export type PageHeaderTab = {
  value: string;
  label: ReactNode;
  /** Link tabs navigate (cmd-click opens a new tab). */
  href?: string;
  disabled?: boolean;
};

export type PageHeaderTabsProps = {
  /** Defaults to a single "All" tab. */
  tabs?: PageHeaderTab[];
  /** Hide the tabs row when a page has no meaningful section navigation. */
  hideTabs?: boolean;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  /** Right side of the tabs row (filters, view toggles…). */
  tabsEnd?: ReactNode;
};

type ResolvedBack = {
  href?: PageBackHref | null;
  fallbackHref: PageBackHref;
  useHistory: boolean;
};

const DEFAULT_TABS: PageHeaderTab[] = [{ value: "all", label: "All" }];

function resolveBack(
  back: PageHeaderBackProp | undefined,
  pathname: string,
): ResolvedBack {
  if (back === false || back === "auto" || back === undefined) {
    const href = getPageBackHref(pathname);
    if (href) return { href, fallbackHref: href, useHistory: false };
    return { fallbackHref: getPageBackFallback(pathname), useHistory: true };
  }
  if (typeof back === "string") {
    return { href: back, fallbackHref: back, useHistory: false };
  }
  const fallback = back.href ?? getPageBackFallback(pathname);
  return {
    href: back.href ?? null,
    fallbackHref: fallback,
    useHistory: Boolean(back.useHistory) || !back.href,
  };
}

const rootClass = pageHeaderRootClass;
const topRowClass = pageHeaderTopRowClass;
const tabsRowClass = pageHeaderTabsRowClass;

export function PageHeaderTabs({
  tabs,
  activeTab,
  onTabChange,
  tabsEnd,
}: PageHeaderTabsProps) {
  return (
    <PageHeaderTabsRow
      tabs={tabs?.length ? tabs : DEFAULT_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      end={tabsEnd}
      LinkComponent={Link as never}
    />
  );
}

export function PageHeader({
  title,
  titleAccessory,
  description,
  action,
  metadata,
  meta,
  back = "auto",
  tabs,
  activeTab,
  onTabChange,
  tabsEnd,
  hideTabs,
}: {
  title: string;
  titleAccessory?: ReactNode;
  description?: string;
  action?: ReactNode;
  /** @deprecated use `meta` */
  metadata?: ReactNode;
  /** Badges, links, key/value data under the title row. Height is fixed. */
  meta?: ReactNode;
  back?: PageHeaderBackProp;
} & PageHeaderTabsProps) {
  const pathname = usePathname() ?? "";
  const resolved = resolveBack(back, pathname);
  return (
    <PageHeaderLayout
      back={
        <PageBackButton
          href={resolved.href}
          fallbackHref={resolved.fallbackHref}
          useHistory={resolved.useHistory}
        />
      }
      title={title}
      titleAccessory={titleAccessory}
      description={description}
      actions={action}
      meta={meta ?? metadata}
      tabs={
        hideTabs ? null : (
          <PageHeaderTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            tabsEnd={tabsEnd}
          />
        )
      }
    />
  );
}

function PageHeaderSkeletonTopRow({
  withDescription,
  withAction,
}: {
  withDescription: boolean;
  withAction: boolean;
}) {
  const backSkeleton = (
    <Skeleton className="size-8 shrink-0 self-center rounded-md [grid-area:leading] md:self-start" />
  );
  const titleSkeleton = (
    <div
      className={cn(
        "flex h-8 min-w-0 items-center",
        withDescription && pageHeaderDescriptionGridTitleClass(true),
      )}
    >
      <Skeleton className="h-5 w-40" />
    </div>
  );
  const actionSkeleton = withAction ? (
    <Skeleton
      className={cn(
        "h-8 w-28 shrink-0 rounded-md",
        withDescription && pageHeaderDescriptionGridActionClass(true),
      )}
    />
  ) : null;

  if (!withDescription) {
    return (
      <div className={topRowClass}>
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {titleSkeleton}
        </div>
        {actionSkeleton}
      </div>
    );
  }

  const mobileCols = withAction
    ? "grid-cols-[auto_minmax(0,1fr)_auto]"
    : "grid-cols-[auto_minmax(0,1fr)]";
  const mobileAreas = withAction
    ? "[grid-template-areas:'leading_title_action'_'desc_desc_desc']"
    : "[grid-template-areas:'leading_title_title'_'desc_desc_desc']";
  const desktopAreas = withAction
    ? "md:[grid-template-areas:'leading_title_action'_'leading_desc_desc']"
    : "md:[grid-template-areas:'leading_title_title'_'leading_desc_desc']";

  return (
    <div
      className={cn(
        pageHeaderDescriptionGridClass,
        mobileCols,
        mobileAreas,
        desktopAreas,
        "md:grid-cols-[auto_minmax(0,1fr)_auto]",
      )}
    >
      {backSkeleton}
      {titleSkeleton}
      {withAction ? (
        actionSkeleton
      ) : (
        <div className="hidden [grid-area:action]" aria-hidden />
      )}
      <div className={pageHeaderDescriptionGridDescClass(true)}>
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
    </div>
  );
}

/** Same footprint as {@link PageHeader} while data loads. */
export function PageHeaderSkeleton({
  withDescription = true,
  withAction = true,
  tabCount = 1,
}: {
  withDescription?: boolean;
  withAction?: boolean;
  tabCount?: number;
}) {
  return (
    <div className={rootClass} aria-hidden data-slot="page-header-skeleton">
      <PageHeaderSkeletonTopRow
        withDescription={withDescription}
        withAction={withAction}
      />
      <div className={pageHeaderMetaRowClass(true)}>
        <Skeleton className="h-3 w-32" />
      </div>
      <div className={tabsRowClass}>
        <div className="flex h-9 items-center gap-3 px-2.5">
          {Array.from({ length: tabCount }, (_, i) => (
            <Skeleton key={`tab-${String(i)}`} className="h-3 w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use `PageHeader` — kept for existing imports. */
export const PageTitleRow = PageHeader;
