import type { ReactNode } from "react";
import { cn } from "../lib/utils";
export function SettingsRow({
  label,
  description,
  required = false,
  className,
  children,
}: {
  label: ReactNode;
  description?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-1.5 px-4 py-2.5 md:grid-cols-[13.75rem_minmax(0,1fr)] md:items-center md:gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm">
            {label}
            {required ? (
              <span className="text-destructive" aria-hidden="true">
                {" "}
                *
              </span>
            ) : null}
          </p>
          {description ? (
            <p className="mt-0.5 text-muted-foreground text-xs">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-start gap-2 md:justify-end">
        {children}
      </div>
    </div>
  );
}

/** Label on the left, constrained field control on the right (settings forms). */
