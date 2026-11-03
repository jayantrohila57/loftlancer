"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import { cn } from "@loftlancer/ui/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function DataTableEmpty({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Flush inside a framed DataTable — no nested border or extra inset card. */
  compact?: boolean;
}) {
  return (
    <Empty
      className={cn(
        compact
          ? "w-full max-w-none gap-3 border-0 bg-transparent p-0 py-6 shadow-none"
          : "border border-dashed",
      )}
    >
      <EmptyHeader className={compact ? "max-w-none" : undefined}>
        {Icon ? (
          <EmptyMedia variant="icon" className={compact ? "mb-2" : undefined}>
            <Icon className="size-5" aria-hidden />
          </EmptyMedia>
        ) : null}
        <EmptyTitle className={compact ? "text-base" : undefined}>
          {title}
        </EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
