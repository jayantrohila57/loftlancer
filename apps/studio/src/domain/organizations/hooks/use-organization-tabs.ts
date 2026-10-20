"use client";

import { usePathname } from "next/navigation";
import type { PageHeaderTab } from "@/components/layout/page-header";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import type { OrgSection } from "@/utils/navigation";
import { routes } from "@/utils/navigation";

/** Same section tabs as the org settings frame, for the org overview header. */
export function useOrganizationTabs(slug: string) {
  const pathname = usePathname() ?? "";
  const base = routes.org(slug);
  const canViewMembers = useCan("member.list").allowed;
  const canInvite = useCan("member.invite").allowed;
  const canViewTeams = useCan("organization.hub.view").allowed;
  const canViewRoles = useCan("organization.settings.view").allowed;
  const canViewSettings = useCan("organization.settings.view").allowed;
  const canViewActivity = useCan("audit.timeline.view.org").allowed;
  const peopleHref = routes.orgSection(
    slug,
    canViewMembers
      ? "members"
      : canInvite
        ? "invitations"
        : canViewTeams
          ? "teams"
          : "roles",
  );
  const peopleSections: OrgSection[] = [
    "members",
    "invitations",
    "teams",
    "roles",
  ];
  const onPeopleRoute = peopleSections.some(
    (section) =>
      pathname === routes.orgSection(slug, section) ||
      pathname.startsWith(`${routes.orgSection(slug, section)}/`),
  );
  const tabs: PageHeaderTab[] = [
    { value: base, label: "Overview", href: base },
    ...(canViewMembers || canInvite || canViewTeams || canViewRoles
      ? [{ value: peopleHref, label: "People", href: peopleHref }]
      : []),
    {
      value: routes.orgSection(slug, "projects"),
      label: "Projects",
      href: routes.orgSection(slug, "projects"),
    },
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
            label: "Settings",
            href: `${base}/settings`,
          },
        ]
      : []),
  ];
  return { tabs, activeTab: onPeopleRoute ? peopleHref : pathname };
}
