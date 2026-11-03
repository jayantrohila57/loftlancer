import {
  layoutContentClass,
  layoutSectionStackClass,
  layoutToolbarClass,
} from "@features/shell/utils/shell.layout-spacing.utils";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type { PageHeaderBackProp } from "@/components/layout/page-header";
export { PageHeader, PageTitleRow } from "@/components/layout/page-header";
export {
  PageHeaderActionButton,
  PageHeaderActionLabel,
  pageHeaderActionButtonClassName,
  pageHeaderActionCompactClassName,
  pageHeaderActionLabelClassName,
} from "@/components/layout/page-header-action-button";

export function PageMain({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(layoutContentClass, className)}>{children}</div>;
}

export function PageStack({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(layoutSectionStackClass, className)}>{children}</div>
  );
}

export {
  DashboardPageHeaderBar as PageHeaderBar,
  DashboardPageHeaderRow as PageHeaderRow,
} from "@features/shell/core/client";

export function PageToolbar({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(layoutToolbarClass, className)}>{children}</div>;
}

export { layoutFormStackClass } from "@features/shell/utils/shell.layout-spacing.utils";
