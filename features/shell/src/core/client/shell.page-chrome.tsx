import { cn } from "@loftlancer/ui/utils";
import type { ReactNode } from "react";
import {
  layoutChromeClass,
  layoutChromeRowClass,
} from "../../utils/shell.layout-spacing.utils";

/** Sticky dashboard header bar (below sidebar inset). */
export function DashboardPageHeaderBar({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <header
      className={cn(
        "bg-background relative z-50 shrink-0 border-b",
        layoutChromeClass,
        className,
      )}
    >
      {children}
    </header>
  );
}

export function DashboardPageHeaderRow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(layoutChromeRowClass, className)}>{children}</div>;
}
