import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuditLogs from "@/domain/audit/components/audit-logs";
import { TimelinePageClient } from "@/domain/timeline/components/timeline-page-client";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { OrganizationsFeatureGate } from "@/module/organizations/organizations.organizations.feature.gate";
import { OrganizationSectionPage } from "@/module/organizations/organizations.section";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Activity",
  description: "Recent changes across this organization.",
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
        title="Activity"
        description="Audit events for this organization."
      >
        {timeline ? <TimelinePageClient scope="org" /> : <AuditLogs />}
      </OrganizationSectionPage>
    </OrganizationsFeatureGate>
  );
}
