import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { guardAuthenticatedPage } from "@/lib/page-guards";
import { siteConfig } from "@/lib/siteConfig";
import {
  loadOrganizationsDirectory,
  redirectLegacyOrganizationDirectory,
} from "../../../server/page/server.organizations-pages.page";
import { OrganizationsDirectory } from "../components/client.organizations-directory";
import { OrganizationListSkeleton } from "../skeletons/client.organization-skeleton";

export const organizationsDirectoryMetadata: Metadata = {
  title: "Organizations",
  description: `Manage organizations and members in ${siteConfig.name}.`,
};
export const newOrganizationMetadata: Metadata = {
  title: "New organization",
  description: `Manage organizations and members in ${siteConfig.name}.`,
};

export async function OrganizationsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ directory?: string }>;
}) {
  await guardAuthenticatedPage();
  if (!isOrganizationsEnabled()) notFound();
  const { directory } = await searchParams;
  await redirectLegacyOrganizationDirectory(directory);
  await loadOrganizationsDirectory();
  return (
    <Suspense fallback={<OrganizationListSkeleton />}>
      <OrganizationsDirectory />
    </Suspense>
  );
}

export async function NewOrganizationPage() {
  await guardAuthenticatedPage();
  if (!isOrganizationsEnabled()) notFound();
  await loadOrganizationsDirectory();
  return (
    <Suspense fallback={<OrganizationListSkeleton />}>
      <OrganizationsDirectory createRoute />
    </Suspense>
  );
}
