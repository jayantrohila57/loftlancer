"use client";

import { usePathname } from "next/navigation";
import type { PageHeaderTab } from "@/components/layout/page-header";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import type { OrgSection } from "@/utils/navigation";
import { routes } from "@/utils/navigation";

/** Organization pages expose sections here; entity lists remain in the sidebar. */
export function useOrganizationTabs(slug: string) {
  const pathname = usePathname() ?? "";
  const base = routes.org(slug);
  const canViewMembers = useCan("member.list").allowed;
  const canInvite = useCan("member.invite").allowed;
  const canViewRoles = useCan("organization.settings.view").allowed;
  const canViewSettings = useCan("organization.settings.view").allowed;
  const canViewActivity = useCan("audit.timeline.view.org").allowed;
  const peopleSections: OrgSection[] = ["members", "invitations", "roles"];
  const tabs: PageHeaderTab[] = [
    { value: base, label: "Overview", href: base },
    ...(canViewMembers
      ? [
          {
            value: routes.orgSection(slug, "members"),
            label: "Members",
            href: routes.orgSection(slug, "members"),
          },
        ]
      : []),
    ...(canInvite
      ? [
          {
            value: routes.orgSection(slug, "invitations"),
            label: "Invitations",
            href: routes.orgSection(slug, "invitations"),
          },
        ]
      : []),
    ...(canViewRoles
      ? [
          {
            value: routes.orgSection(slug, "roles"),
            label: "Roles & access",
            href: routes.orgSection(slug, "roles"),
          },
        ]
      : []),
    ...(isActionsAuditEnabledOnClient() && canViewActivity
      ? [
          {
            value: `${base}/activity`,
            label: "Activity",
            href: `${base}/activity`,
          },
        ]
      : []),
    ...(canViewSettings
      ? [
          {
            value: `${base}/settings`,
            label: "Organization settings",
            href: `${base}/settings`,
          },
        ]
      : []),
  ];
  const activeSection = peopleSections.find((section) => {
    const href = routes.orgSection(slug, section);
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  return {
    tabs,
    activeTab: activeSection
      ? routes.orgSection(slug, activeSection)
      : pathname,
  };
}
