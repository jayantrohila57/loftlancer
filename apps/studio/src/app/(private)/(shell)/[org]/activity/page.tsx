import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuditLogs from "@/domain/audit/components/audit-logs";
import { OrganizationSectionPage } from "@/domain/organizations/components/organization-section-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Organization activity",
  description: "Organization activity timeline.",
};

export default async function OrganizationTimelineRoute({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "timeline");
  const timeline = isActionsAuditEnabledOnServer();

  return (
    <OrganizationsFeatureGate>
      <OrganizationSectionPage
        slug={slug}
        title="Organization activity"
        activity
        description="Audit events for this organization."
      >
        {timeline ? <TimelinePageClient scope="org" /> : <AuditLogs />}
      </OrganizationSectionPage>
    </OrganizationsFeatureGate>
  );
}
