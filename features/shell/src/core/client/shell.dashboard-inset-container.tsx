import { cn } from "@loftlancer/ui/utils";
import type { ReactNode } from "react";
import { layoutInsetContainerWideClass } from "../../utils/shell.layout-spacing.utils";

export function DashboardInsetContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
  /** @deprecated Width is always full inset; kept for call-site compatibility. */
  width?: "wide" | "narrow";
}) {
  return (
    <div className={cn(layoutInsetContainerWideClass, className)}>
      {children}
    </div>
  );
}
