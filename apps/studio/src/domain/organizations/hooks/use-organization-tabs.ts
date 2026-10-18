"use client";

import { usePathname } from "next/navigation";
import type { PageHeaderTab } from "@/components/layout/page-header";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";

import { routes } from "@/utils/navigation";

/** Same section tabs as the org settings frame, for the org overview header. */
export function useOrganizationTabs(slug: string) {
  const pathname = usePathname() ?? "";
  const base = routes.org(slug);
  const tabs: PageHeaderTab[] = [
    { value: base, label: "Overview", href: base },
    { value: `${base}/settings`, label: "Settings", href: `${base}/settings` },
    { value: `${base}/members`, label: "Members", href: `${base}/members` },
    {
      value: `${base}/invitations`,
      label: "Invitations",
      href: `${base}/invitations`,
    },
    { value: `${base}/teams`, label: "Teams", href: `${base}/teams` },
    { value: `${base}/roles`, label: "Roles", href: `${base}/roles` },
    ...(isActionsAuditEnabledOnClient()
      ? [
          {
            value: `${base}/activity`,
            label: "Activity",
            href: `${base}/activity`,
          },
        ]
      : []),
  ];
  return { tabs, activeTab: pathname };
}
