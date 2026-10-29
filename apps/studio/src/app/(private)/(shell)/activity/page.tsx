import type { Metadata } from "next";
import DashboardSection from "@/components/section-dashboard";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardAuthenticatedPage, guardPageAction } from "@/lib/page-guards";
import AuditLogs from "@/module/activity/activity.audit.logs";
import { TimelinePageClient } from "@/module/activity/activity.timeline.page.client";

export const metadata: Metadata = {
  title: "Activity",
  description: "Your activity across organizations.",
};

/** User-level activity (#299): your own events; org activity is /[org]/activity. */
export default async function ActivityPage() {
  if (!isActionsAuditEnabledOnServer()) {
    await guardPageAction("audit.timeline.view.org");
    return (
      <DashboardSection
        title="Activity"
        description="Activity from your projects across organizations."
        back={false}
      >
        <AuditLogs />
      </DashboardSection>
    );
  }

  await guardAuthenticatedPage();
  return (
    <DashboardSection
      title="Activity"
      description="Everything you did, across all your organizations."
      back={false}
    >
      <TimelinePageClient scope="self" />
    </DashboardSection>
  );
}
