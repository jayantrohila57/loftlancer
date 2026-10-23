"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { BASE_PATH } from "@/lib/base-path";
import { routes } from "@/utils/navigation";
import {
  type OrganizationDetail,
  useOrganizationBySlug,
} from "../hooks/use-organization-by-slug";
import { useOrganizationTabs } from "../hooks/use-organization-tabs";
import { isOrganizationShellRoute } from "../lib/organization-layout";
import { OrganizationIdentityProvider } from "./organization-identity-context";

/** Stable organization identity and navigation shared by every org route. */
export function OrganizationLayoutShell({
  slug,
  initialOrganization,
  children,
}: {
  slug: string;
  initialOrganization: Pick<OrganizationDetail, "id" | "name" | "slug">;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const showFrame = isOrganizationShellRoute(pathname, slug, BASE_PATH);

  return (
    <OrganizationIdentityProvider organization={initialOrganization}>
      {showFrame ? (
        <OrganizationFrame
          key={slug}
          slug={slug}
          initialOrganization={initialOrganization}
        >
          {children}
        </OrganizationFrame>
      ) : (
        children
      )}
    </OrganizationIdentityProvider>
  );
}

function OrganizationFrame({
  slug,
  initialOrganization,
  children,
}: {
  slug: string;
  initialOrganization: Pick<OrganizationDetail, "id" | "name" | "slug">;
  children: React.ReactNode;
}) {
  const { organization, listItem, status } = useOrganizationBySlug(
    slug,
    initialOrganization,
  );
  if (status === "not-found") notFound();
  const { tabs, activeTab } = useOrganizationTabs(slug);
  const pathname = usePathname() ?? "";
  const name = organization?.name ?? listItem?.name ?? slug;
  const orgHome = routes.org(slug);
  const isOrgHome = pathname === orgHome;
  const teamsHref = routes.orgSection(slug, "teams");
  const isTeamDetail = pathname.startsWith(`${teamsHref}/`);

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={{
        href: isOrgHome
          ? routes.organizationsDirectory()
          : isTeamDetail
            ? teamsHref
            : orgHome,
        label: isOrgHome ? "Organizations" : isTeamDetail ? "Teams" : name,
      }}
      title={name}
      description={
        isOrgHome ? "Organization workspace and administration." : undefined
      }
      tabs={tabs.map((tab) => ({
        href: tab.href ?? "#",
        label: tab.label,
        active: tab.value === activeTab || pathname === tab.href,
      }))}
    >
      {children}
    </SettingsFrame>
  );
}
