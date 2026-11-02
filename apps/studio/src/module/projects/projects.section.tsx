import type { ReactNode } from "react";

export function ProjectSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}
