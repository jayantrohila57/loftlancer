import type { ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function SettingsPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "divide-border/60 border-border/60 bg-card text-card-foreground divide-y rounded-md border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SettingsSectionHeader({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: AppIconName;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{title}</h3>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </p>
          ) : null}
        </div>
        {icon ? <AppIcon name={icon} /> : null}
      </div>
    </div>
  );
}

export function SettingsRow({
  label,
  description,
  required = false,
  icon,
  className,
  children,
}: {
  label: ReactNode;
  description?: string;
  required?: boolean;
  icon?: AppIconName;
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
        {icon ? <AppIcon name={icon} className="mt-0.5" /> : null}
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {label}
            {required ? <RequiredMarker /> : null}
          </p>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
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
export function SettingsField({
  label,
  description,
  required = false,
  icon,
  className,
  controlClassName,
  children,
}: {
  label: ReactNode;
  description?: string;
  required?: boolean;
  icon?: AppIconName;
  className?: string;
  controlClassName?: string;
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
        {icon ? <AppIcon name={icon} className="mt-0.5" /> : null}
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {label}
            {required ? <RequiredMarker /> : null}
          </p>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className={cn("w-full min-w-0", controlClassName)}>{children}</div>
    </div>
  );
}

function RequiredMarker() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export const settingsControlWidthClass = "w-full min-w-0";
