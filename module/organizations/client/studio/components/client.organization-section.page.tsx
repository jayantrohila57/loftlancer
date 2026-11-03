type OrganizationSectionPageProps = {
  slug: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

/** Route-specific content heading. Organization identity and tabs live in the layout. */
export function OrganizationSectionPage({
  title,
  description,
  children,
  action,
}: OrganizationSectionPageProps) {
  return (
    <section className="min-w-0 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
