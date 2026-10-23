import { routes } from "@loftlancer/ui/studio-routes";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";
import { guardPageAction } from "@/lib/page-guards";
import { studioDashboardPath } from "@/lib/studio-url";

export default async function SettingsTimelinePage() {
  await guardPageAction("audit.timeline.view.self");

  if (!isActionsAuditEnabledOnServer()) {
    redirect("/settings/profile" as Route);
  }

  redirect(studioDashboardPath(routes.activity()) as Route);
}
