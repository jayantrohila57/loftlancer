"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/** A consistent disclosure section for page subsections. */
export function AccordionSection({
  title,
  description,
  actions,
  children,
  defaultOpen = true,
  className = "",
  onToggle,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  onToggle?: (open: boolean) => void;
}) {
  return (
    <details
      open={defaultOpen}
      onToggle={(event) => onToggle?.(event.currentTarget.open)}
      className={`group min-w-0 rounded-xl border bg-card ${className}`}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-sm">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-muted-foreground text-xs">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      {actions ? (
        <div className="flex justify-end px-4 pt-3">{actions}</div>
      ) : null}
      <div className="border-t px-4 py-4">{children}</div>
    </details>
  );
}
