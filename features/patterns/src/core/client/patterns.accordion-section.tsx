"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

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
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={`group bg-card min-w-0 rounded-xl border ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          onToggle?.(nextOpen);
        }}
        className="focus-visible:ring-ring focus-visible:ring-offset-background flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{title}</span>
          {description ? (
            <span className="text-muted-foreground mt-0.5 block text-xs">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`text-muted-foreground size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div id={contentId} hidden={!open}>
        {actions ? (
          <div className="flex justify-end px-4 pt-3">{actions}</div>
        ) : null}
        <div className="border-t px-4 py-4">{children}</div>
      </div>
    </section>
  );
}
