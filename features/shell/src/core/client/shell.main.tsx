"use client";

import { cn } from "@loftlancer/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ReactNode } from "react";
import { layoutDashboardScrollClass } from "../../utils/shell.layout-spacing.utils";

const mainVariants = cva("relative", {
  variants: {
    variant: {
      default: "flex flex-col",
      dashboard: layoutDashboardScrollClass,
      centered: "flex flex-col items-center justify-center py-16",
    },
    scale: {
      full: "h-full w-full",
      default: "h-full min-h-screen w-full",
      dashboard: "min-h-0 w-full flex-1",
    },
    padding: {
      default: "",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    scale: "default",
    padding: "default",
  },
});

export type DashboardShellMainProps = {
  className?: string;
  children: ReactNode;
} & VariantProps<typeof mainVariants>;

export const DashboardShellMain = forwardRef<
  HTMLDivElement,
  DashboardShellMainProps
>(({ className, variant, scale, padding, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(mainVariants({ variant, scale, padding, className }))}
    {...props}
  >
    {children}
  </div>
));
DashboardShellMain.displayName = "DashboardShellMain";
