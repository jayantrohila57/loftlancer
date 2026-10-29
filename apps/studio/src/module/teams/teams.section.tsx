import type { ReactNode } from "react";

export function TeamSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}
