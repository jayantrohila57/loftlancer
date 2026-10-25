"use client";

import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationBrandingEditor } from "./organization-branding-editor";
import { OrganizationLifecycleSection } from "./organization-lifecycle-section";
import { OrganizationPreferencesEditor } from "./organization-preferences-editor";
import { OrganizationProfileEditor } from "./organization-profile-editor";
import { OrganizationSectionPage } from "./organization-section-page";
import { OrganizationSecurityDomains } from "./organization-security-domains";
import { OrganizationSettingsForm } from "./organization-settings-form";
import { OrganizationSettingsContentSkeleton } from "./skeletons";

export function OrganizationSettingsPage({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Organization settings"
      description="Organization identity, profile, and lifecycle."
    >
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
    </OrganizationSectionPage>
  );
}
