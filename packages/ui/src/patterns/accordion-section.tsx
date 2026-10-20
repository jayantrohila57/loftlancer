"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/** A consistent disclosure section for page subsections. */
export function AccordionSection({
  title,
  children,
  defaultOpen = true,
  className = "",
  onToggle,
}: {
  title: ReactNode;
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
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-sm [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t px-4 py-4">{children}</div>
    </details>
  );
}
