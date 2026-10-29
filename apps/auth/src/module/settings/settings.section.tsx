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
        <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </header>
      {children}
    </section>
  );
}
