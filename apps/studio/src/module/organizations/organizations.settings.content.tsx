"use client";

import { OrganizationBrandingEditor } from "@/module/organizations/organizations.organization.branding.editor";
import { OrganizationLifecycleSection } from "@/module/organizations/organizations.organization.lifecycle.section";
import { OrganizationPreferencesEditor } from "@/module/organizations/organizations.organization.preferences.editor";
import { OrganizationProfileEditor } from "@/module/organizations/organizations.organization.profile.editor";
import { OrganizationSecurityDomains } from "@/module/organizations/organizations.organization.security.domains";
import { OrganizationSettingsForm } from "@/module/organizations/organizations.organization.settings.form";
import { OrganizationSettingsContentSkeleton } from "@/module/organizations/organizations.skeletons";
import { useOrganizationBySlug } from "@/module/organizations/organizations.use.organization.by.slug";

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
