import { Button } from "@loftlancer/ui/button";
import { layoutDashboardPageStackClass } from "@loftlancer/ui/layout-spacing";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageStack } from "@/components/layout/app-layout";
import {
  PageHeader,
  type PageHeaderBackProp,
  type PageHeaderTabsProps,
} from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

interface SectionProps extends PageHeaderTabsProps {
  title?: string;
  description?: string;
  titleAccessory?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  /** @deprecated use actionLabel */
  actionUrl?: string;
  children: React.ReactNode;
  /** Meta row under the title (badges, links, key/value). */
  metadata?: ReactNode;
  meta?: ReactNode;
  /** Rendered under metadata (e.g. stat cards). */
  stats?: ReactNode;
  /** `auto` is route-aware (no back on dashboard list routes); `false` hides; string sets parent href */
  back?: PageHeaderBackProp;
}

export default function DashboardSection({
  title,
  description,
  titleAccessory,
  action,
  actionLabel,
  actionHref,
  actionUrl,
  children,
  metadata,
  meta,
  stats,
  back = "auto",
  tabs,
  hideTabs,
  activeTab,
  onTabChange,
  tabsEnd,
}: SectionProps) {
  const resolvedActionHref = actionHref ?? actionUrl;
  const trailingAction =
    action ??
    (actionLabel && resolvedActionHref ? (
      <Button
        variant="default"
        size="sm"
        className="h-8"
        render={<Link href={resolvedActionHref as Route} />}
      >
        {actionLabel}
      </Button>
    ) : null);

  return (
    <PageStack className={cn(layoutDashboardPageStackClass)}>
      {title ? (
        <PageHeader
          title={title}
          titleAccessory={titleAccessory}
          description={description}
          action={trailingAction}
          meta={meta ?? metadata}
          back={back}
          tabs={tabs}
          hideTabs={hideTabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          tabsEnd={tabsEnd}
        />
      ) : null}
      {stats ? <div className="min-w-0">{stats}</div> : null}
      {children ? <div className="min-w-0">{children}</div> : null}
    </PageStack>
  );
}
