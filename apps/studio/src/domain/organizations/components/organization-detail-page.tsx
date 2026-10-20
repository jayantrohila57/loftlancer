"use client";

import { notFound } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import { isPersonalOrganization } from "@/lib/org-personal";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import {
  OrganizationOverviewSections,
  OrganizationOverviewSectionsSkeleton,
} from "./organization-overview-sections";

export default function OrganizationDetailPage({ slug }: { slug: string }) {
  const { organization, listItem, status, error, reload } =
    useOrganizationBySlug(slug);

  if (status === "not-found") {
    notFound();
  }

  if (status === "error") {
    return (
      <ErrorState
        title="Organization unavailable"
        description={error?.message ?? "Could not load this workspace."}
        onRetry={() => void reload()}
      />
    );
  }

  const meta = listItem ?? organization;
  const personal = meta ? isPersonalOrganization(meta) : false;
  return (
    <section className="min-w-0 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">Overview</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {personal
              ? "Personal workspace overview and administration."
              : "Team workspace overview and administration."}
          </p>
        </div>
      </header>
      {status === "loading" ? (
        <OrganizationOverviewSectionsSkeleton />
      ) : (
        <OrganizationOverviewSections slug={slug} />
      )}
    </section>
  );
}
