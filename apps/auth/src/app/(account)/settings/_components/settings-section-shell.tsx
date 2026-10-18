import type { ReactNode } from "react";
import { ActivityOverview } from "@/domain/settings/components/activity-overview";

export function SettingsSectionShell({
  title,
  description,
  children,
  activity = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  /** @deprecated stats moved to the Health rail card. */
  showStats?: boolean;
  /** Show the activity heatmap above the section (Activity tab). */
  activity?: boolean;
}) {
  return (
    <section className="min-w-0 space-y-4">
      <header>
        <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </header>
      {activity ? <ActivityOverview scope="self" title="User activity" /> : null}
      {children}
    </section>
  );
}
