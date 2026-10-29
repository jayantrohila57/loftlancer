"use client";

import { OrganizationBrandingEditor } from "@/domain/organizations/components/organization-branding-editor";
import { OrganizationLifecycleSection } from "@/domain/organizations/components/organization-lifecycle-section";
import { OrganizationPreferencesEditor } from "@/domain/organizations/components/organization-preferences-editor";
import { OrganizationProfileEditor } from "@/domain/organizations/components/organization-profile-editor";
import { OrganizationSecurityDomains } from "@/domain/organizations/components/organization-security-domains";
import { OrganizationSettingsForm } from "@/domain/organizations/components/organization-settings-form";
import { OrganizationSettingsContentSkeleton } from "@/domain/organizations/components/skeletons";
import { useOrganizationBySlug } from "@/domain/organizations/hooks/use-organization-by-slug";

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
