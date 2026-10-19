"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { BASE_PATH } from "@/lib/base-path";
import { routes } from "@/utils/navigation";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { useOrganizationTabs } from "../hooks/use-organization-tabs";
import { isOrganizationShellRoute } from "../lib/organization-layout";

/** Stable organization identity and navigation shared by every org route. */
export function OrganizationLayoutShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  if (!isOrganizationShellRoute(pathname, slug, BASE_PATH)) return children;

  return <OrganizationFrame slug={slug}>{children}</OrganizationFrame>;
}

function OrganizationFrame({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { organization, listItem, status } = useOrganizationBySlug(slug);
  if (status === "not-found") notFound();
  const { tabs } = useOrganizationTabs(slug);
  const pathname = usePathname() ?? "";
  const name = organization?.name ?? listItem?.name ?? slug;

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={{ href: routes.home(), label: "Organizations" }}
      avatar={{ src: organization?.logo, name }}
      title={name}
      description="Organization workspace and administration."
      identity={name}
      subtitle={`/${slug}`}
      tabs={tabs.map((tab) => ({
        href: tab.href ?? "#",
        label: tab.label,
        active: pathname === tab.href,
      }))}
    >
      {children}
    </SettingsFrame>
  );
}
