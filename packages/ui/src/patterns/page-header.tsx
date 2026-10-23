"use client";

import { ChevronLeft } from "lucide-react";
import type React from "react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  pageHeaderActionsClass,
  pageHeaderBackClass,
  pageHeaderDescriptionGridClass,
  pageHeaderMetaRowClass,
  pageHeaderRootClass,
  pageHeaderTabActiveClass,
  pageHeaderTabClass,
  pageHeaderTabInactiveClass,
  pageHeaderTabsEndClass,
  pageHeaderTabsListClass,
  pageHeaderTabsRowClass,
  pageHeaderTitleClass,
  pageHeaderTitleRowClass,
  pageHeaderTopRowClass,
} from "../lib/page-header-classes";
import {
  pageHeaderDescriptionGridActionClass,
  pageHeaderDescriptionGridDescClass,
  pageHeaderDescriptionGridTitleClass,
} from "../lib/page-header-grid-classes";
import { cn } from "../lib/utils";
import { HorizontalScrollRail } from "./horizontal-scroll-rail";
import { PageHeaderDescription } from "./page-header-description";

/**
 * The one in-app page header (studio dashboard, org, project, app pages and
 * auth account settings). Rows, top to bottom:
 *   1. back · title + description · actions (h-8)
 *   2. meta (fixed h-6, even when empty)
 *   3. tabs (always; a single "All" tab by default) · tabs end slot
 */
export type PageHeaderTabItem = {
  value: string;
  label: ReactNode;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
};

type LinkLike = React.ElementType<{
  href: string;
  className?: string;
  children?: ReactNode;
  role?: string;
  "aria-selected"?: boolean;
  "aria-current"?: "page";
  "aria-disabled"?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  tabIndex?: number;
}>;

export const pageHeaderBackButtonClass = cn(
  pageHeaderBackClass,
  "inline-flex items-center justify-center rounded-lg border bg-background text-foreground shadow-xs/5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

/** Plain back control for apps without a router-aware button. */
export function PageHeaderBackLink({
  href,
  LinkComponent = "a",
}: {
  href?: string;
  LinkComponent?: LinkLike | "a";
}) {
  const L = LinkComponent as React.ElementType;
  // Same chevron as studio's PageBackButton (AppIcon "back") so every
  // header's back control looks identical (#319).
  const icon = <ChevronLeft className="size-4" aria-hidden />;
  if (href) {
    return (
      <L
        href={href}
        className={pageHeaderBackButtonClass}
        aria-label="Back"
        title="Back"
      >
        {icon}
      </L>
    );
  }
  return (
    <button
      type="button"
      className={pageHeaderBackButtonClass}
      aria-label="Back"
      title="Back"
      onClick={() => window.history.back()}
    >
      {icon}
    </button>
  );
}

export function PageHeaderTabsRow({
  tabs,
  activeTab,
  onTabChange,
  end,
  viewportClassName,
  LinkComponent = "a",
}: {
  tabs?: PageHeaderTabItem[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  end?: ReactNode;
  viewportClassName?: string;
  LinkComponent?: LinkLike | "a";
}) {
  const L = LinkComponent as React.ElementType;
  const list = tabs?.length ? tabs : [{ value: "all", label: "All" }];
  const value = activeTab ?? list[0]?.value;
  const tabsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tabsListRef.current
      ?.querySelector(`[data-tab-value="${CSS.escape(value ?? "")}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value]);

  return (
    <div className={pageHeaderTabsRowClass} data-slot="page-header-tabs">
      <HorizontalScrollRail
        compactControls
        className="min-w-0 flex-1"
        viewportClassName={viewportClassName}
      >
        <div
          ref={tabsListRef}
          role="tablist"
          aria-label="Sections"
          className={cn(pageHeaderTabsListClass, "w-max overflow-visible")}
        >
          {list.map((tab) => {
            const active = tab.value === value;
            const className = cn(
              pageHeaderTabClass,
              active ? pageHeaderTabActiveClass : pageHeaderTabInactiveClass,
              "min-h-10 sm:min-h-0",
              tab.disabled &&
                (tab.disabledReason
                  ? "cursor-not-allowed opacity-60"
                  : "pointer-events-none opacity-60"),
            );
            return tab.href ? (
              tab.disabled && tab.disabledReason ? (
                <Tooltip key={tab.value}>
                  <TooltipTrigger
                    render={
                      <L
                        href={tab.href}
                        role="tab"
                        aria-selected={active}
                        aria-current={active ? "page" : undefined}
                        aria-disabled="true"
                        data-tab-value={tab.value}
                        className={className}
                        onClick={(event: React.MouseEvent<HTMLAnchorElement>) =>
                          event.preventDefault()
                        }
                      />
                    }
                  >
                    {tab.label}
                  </TooltipTrigger>
                  <TooltipContent>{tab.disabledReason}</TooltipContent>
                </Tooltip>
              ) : (
                <L
                  key={tab.value}
                  href={tab.href}
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? "page" : undefined}
                  aria-disabled={tab.disabled || undefined}
                  data-tab-value={tab.value}
                  className={className}
                >
                  {tab.label}
                </L>
              )
            ) : (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                data-tab-value={tab.value}
                disabled={tab.disabled}
                className={className}
                onClick={() => onTabChange?.(tab.value)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </HorizontalScrollRail>
      {end ? <div className={pageHeaderTabsEndClass}>{end}</div> : null}
    </div>
  );
}

function PageHeaderTitleHeading({
  title,
  titleAccessory,
  className,
}: {
  title: ReactNode;
  titleAccessory?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(pageHeaderTitleRowClass, className)}>
      <h1 className={pageHeaderTitleClass}>{title}</h1>
      {titleAccessory}
    </div>
  );
}

function PageHeaderDescriptionSlot({
  description,
}: {
  description: ReactNode;
}) {
  if (typeof description === "string") {
    return <PageHeaderDescription text={description} />;
  }
  return description;
}

function PageHeaderTopRow({
  back,
  title,
  titleAccessory,
  description,
  actions,
  descriptionGapClassName,
}: {
  back?: ReactNode | null;
  title: ReactNode;
  titleAccessory?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  descriptionGapClassName?: string;
}) {
  const hasBack = back != null;
  const hasAction = Boolean(actions);
  const hasDescription = description != null && description !== false;

  if (!hasDescription) {
    return (
      <div className={pageHeaderTopRowClass}>
        {hasBack ? back : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <PageHeaderTitleHeading
            title={title}
            titleAccessory={titleAccessory}
          />
        </div>
        <div
          className={cn(pageHeaderActionsClass, "*:data-[slot=button]:h-8")}
          data-slot="page-header-actions"
        >
          {actions}
        </div>
      </div>
    );
  }

  const mobileCols = hasBack
    ? hasAction
      ? "grid-cols-[auto_minmax(0,1fr)_auto]"
      : "grid-cols-[auto_minmax(0,1fr)]"
    : hasAction
      ? "grid-cols-[minmax(0,1fr)_auto]"
      : "grid-cols-1";

  const mobileAreas = hasBack
    ? hasAction
      ? "[grid-template-areas:'leading_title_action'_'desc_desc_desc']"
      : "[grid-template-areas:'leading_title_title'_'desc_desc_desc']"
    : hasAction
      ? "[grid-template-areas:'title_action'_'desc_desc']"
      : "[grid-template-areas:'title'_'desc']";

  const desktopAreas = hasBack
    ? hasAction
      ? "md:[grid-template-areas:'leading_title_action'_'leading_desc_desc']"
      : "md:[grid-template-areas:'leading_title_title'_'leading_desc_desc']"
    : hasAction
      ? "md:[grid-template-areas:'title_action'_'desc_desc']"
      : "md:[grid-template-areas:'title'_'desc']";

  return (
    <div
      className={cn(
        pageHeaderDescriptionGridClass,
        descriptionGapClassName,
        mobileCols,
        mobileAreas,
        desktopAreas,
        hasBack && "md:grid-cols-[auto_minmax(0,1fr)_auto]",
      )}
    >
      {hasBack ? (
        <div className="self-center [grid-area:leading] md:self-start">
          {back}
        </div>
      ) : null}
      <PageHeaderTitleHeading
        title={title}
        titleAccessory={titleAccessory}
        className={pageHeaderDescriptionGridTitleClass(hasBack)}
      />
      {hasAction ? (
        <div
          className={cn(
            pageHeaderActionsClass,
            pageHeaderDescriptionGridActionClass(hasBack),
            "*:data-[slot=button]:h-8",
          )}
          data-slot="page-header-actions"
        >
          {actions}
        </div>
      ) : (
        <div
          className="hidden [grid-area:action]"
          data-slot="page-header-actions"
          aria-hidden
        />
      )}
      <div className={pageHeaderDescriptionGridDescClass(hasBack)}>
        <PageHeaderDescriptionSlot description={description} />
      </div>
    </div>
  );
}

export function PageHeaderLayout({
  back,
  title,
  titleAccessory,
  description,
  actions,
  descriptionGapClassName,
  meta,
  tabs,
}: {
  back?: ReactNode | null;
  title: ReactNode;
  titleAccessory?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  descriptionGapClassName?: string;
  meta?: ReactNode;
  /** A rendered {@link PageHeaderTabsRow}. */
  tabs: ReactNode;
}) {
  const hasBack = back != null;
  const hasMeta = meta != null && meta !== false;
  return (
    <header className={pageHeaderRootClass} data-slot="page-header">
      <PageHeaderTopRow
        back={back}
        title={title}
        titleAccessory={titleAccessory}
        description={description}
        actions={actions}
        descriptionGapClassName={descriptionGapClassName}
      />
      {hasMeta ? (
        <div
          className={pageHeaderMetaRowClass(hasBack)}
          data-slot="page-header-meta"
        >
          {meta}
        </div>
      ) : null}
      {tabs}
    </header>
  );
}

/**
 * Renders children into the nearest page header's actions slot. For client
 * widgets (e.g. timeline filters) whose state lives below a server-rendered
 * header.
 */
export function PageHeaderActionsPortal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => {
    setTarget(document.querySelector('[data-slot="page-header-actions"]'));
  }, []);
  return target ? createPortal(children, target) : null;
}
