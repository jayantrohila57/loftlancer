import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import {
  guardAuthenticatedPage,
  guardOrganizationSlugMembership,
  guardOrganizationSlugPage,
  guardPageAction,
  preflightOrgSubtree,
} from "@/lib/page-guards";
import { routes } from "@/utils/navigation";
import { organizationGetBySlugController } from "../controller/server.organization-get-by-slug.controller";

export const loadOrganizationsDirectory = cache(async () => {
  const session = await guardAuthenticatedPage();
  await guardPageAction("organization.list");
  return { userId: session.user.id };
});

export const loadOrganizationShell = cache(async (slug: string) => {
  const { org } = await guardOrganizationSlugMembership(slug);
  await preflightOrgSubtree(slug);
  return { org };
});

export const loadOrganizationOverview = cache(async (slug: string) => {
  const { session, org } = await guardOrganizationSlugPage(slug);
  const requestHeaders = await headers();
  const ctx = {
    userId: session.user.id,
    orgId: org.id,
    ip: requestHeaders.get("x-real-ip"),
    userAgent: requestHeaders.get("user-agent"),
  };
  const response = await organizationGetBySlugController({
    input: { slug },
    ctx,
  });
  return {
    org,
    ctx,
    response,
  };
});

export async function redirectLegacyOrganizationDirectory(directory?: string) {
  if (directory === "1") return;
  const legacyOrganization = await guardOrganizationSlugMembership(
    "organizations",
  ).catch(() => null);
  if (legacyOrganization) {
    await guardOrganizationSlugPage("organizations");
    redirect(routes.projects("organizations"));
  }
}

export function requireOrganizationsEnabled(enabled: boolean): void {
  if (!enabled) notFound();
}
