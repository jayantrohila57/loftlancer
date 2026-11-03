"use client";

import { useOrganizationBySlug } from "../hooks/client.use-organization-by-slug.hook";
import { OrganizationSettingsContentSkeleton } from "../skeletons/client.organization-settings-content.skeleton";
import { OrganizationBrandingEditor } from "./client.organization-branding.editor";
import { OrganizationLifecycleSection } from "./client.organization-lifecycle.section";
import { OrganizationPreferencesEditor } from "./client.organization-preferences.editor";
import { OrganizationProfileEditor } from "./client.organization-profile.editor";
import { OrganizationSecurityDomains } from "./client.organization-security-domains";
import { OrganizationSettingsForm } from "./client.organization-settings.form";

export function OrganizationSettingsPage({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);

  return (
    <div className="flex flex-col gap-4">
      {status === "loading" || !organization ? (
        <OrganizationSettingsContentSkeleton />
      ) : (
        <>
          <OrganizationSettingsForm
            key={organization.id}
            organizationId={organization.id}
            mode="settings-hub"
          />
          <OrganizationBrandingEditor />
          <OrganizationProfileEditor />
          <OrganizationPreferencesEditor />
          <OrganizationSecurityDomains />
          <OrganizationLifecycleSection />
        </>
      )}
    </div>
  );
}
