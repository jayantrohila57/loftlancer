import type { ReactNode } from "react";

export function SettingsSectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
  /** @deprecated stats moved to the Health rail card. */
  showStats?: boolean;
}) {
  return (
    <section className="min-w-0 space-y-4">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </header>
      {children}
    </section>
  );
}
