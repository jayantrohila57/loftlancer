"use client";

import { ActivityOverview } from "./activity-overview";
import { OrganizationPeopleNavigation } from "./organization-people-navigation";

type OrganizationSectionPageProps = {
  slug: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  activity?: boolean;
  peopleNavigation?: boolean;
};

/** Route-specific content heading. Organization identity and tabs live in the layout. */
export function OrganizationSectionPage({
  slug,
  title,
  description,
  children,
  action,
  activity = false,
  peopleNavigation = false,
}: OrganizationSectionPageProps) {
  return (
    <section className="min-w-0 space-y-4">
      {peopleNavigation ? <OrganizationPeopleNavigation slug={slug} /> : null}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
          <p className="mt-1 text-muted-foreground text-sm">{description}</p>
        </div>
        {action}
      </header>
      {activity ? (
        <ActivityOverview scope="org" title="Organization activity" />
      ) : null}
      {children}
    </section>
  );
}
