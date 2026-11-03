"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BASE_PATH } from "@/lib/base-path";
import { OrganizationIdentityProvider } from "../components/client.organization-identity.context";
import { isOrganizationShellRoute } from "../config/client.organization-layout";
import { useOrganizationBySlug } from "../hooks/client.use-organization-by-slug.hook";
import { useOrganizationTabs } from "../hooks/client.use-organization-tabs.hook";

export function OrganizationShell({
  slug,
  initialOrganization,
  children,
}: {
  slug: string;
  initialOrganization: { id: string; name: string; slug: string };
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const showFrame = isOrganizationShellRoute(pathname, slug, BASE_PATH);
  return (
    <OrganizationIdentityProvider organization={initialOrganization}>
      {showFrame ? (
        <OrganizationFrame
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
  initialOrganization: { id: string; name: string; slug: string };
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const { organization } = useOrganizationBySlug(slug);
  const { tabs, activeTab } = useOrganizationTabs(slug);
  const name = organization?.name ?? initialOrganization.name;
  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={false}
      title={name}
      tabs={tabs.map((tab) => ({
        href: tab.href,
        label: tab.label,
        active: tab.value === activeTab || pathname === tab.href,
      }))}
    >
      {children}
    </SettingsFrame>
  );
}
