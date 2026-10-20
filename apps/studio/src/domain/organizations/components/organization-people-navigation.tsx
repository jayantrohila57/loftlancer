"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccordionSection } from "@/components/patterns/accordion-section";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { routes } from "@/utils/navigation";

/** People subpages stay together while each route owns its own page content. */
export function OrganizationPeopleNavigation({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "";
  const canViewMembers = useCan("member.list").allowed;
  const canInvite = useCan("member.invite").allowed;
  const canViewTeams = useCan("organization.hub.view").allowed;
  const canViewRoles = useCan("organization.settings.view").allowed;
  const tabs = [
    ...(canViewMembers
      ? [
          {
            value: "members",
            label: "Members",
            href: routes.orgSection(slug, "members"),
          },
        ]
      : []),
    ...(canInvite
      ? [
          {
            value: "invitations",
            label: "Invitations",
            href: routes.orgSection(slug, "invitations"),
          },
        ]
      : []),
    ...(canViewTeams
      ? [
          {
            value: "teams",
            label: "Teams",
            href: routes.orgSection(slug, "teams"),
          },
        ]
      : []),
    ...(canViewRoles
      ? [
          {
            value: "roles",
            label: "Roles & access",
            href: routes.orgSection(slug, "roles"),
          },
        ]
      : []),
  ];
  const activeTab = tabs.find(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  )?.value;

  if (tabs.length === 0) return null;

  return (
    <AccordionSection title="People" className="mb-4">
      <nav
        aria-label="Organization people pages"
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const active = tab.value === activeTab;
          return (
            <Link
              key={tab.value}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </AccordionSection>
  );
}
