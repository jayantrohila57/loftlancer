import { isReservedOrgSlug } from "@loftlancer/ui/studio-routes";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { loadOrganizationShell } from "../../../server/page/server.organizations-pages.page";
import { OrganizationShell } from "../layout/client.organization-shell.layout";

export async function OrganizationShellLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  if (isReservedOrgSlug(slug)) notFound();
  const { org } = await loadOrganizationShell(slug);
  return (
    <OrganizationShell
      slug={slug}
      initialOrganization={{ id: org.id, name: org.name, slug: org.slug }}
    >
      {children}
    </OrganizationShell>
  );
}
