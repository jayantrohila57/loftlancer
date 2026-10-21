"use client";

import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationBrandingEditor } from "./organization-branding-editor";
import { OrganizationLifecycleSection } from "./organization-lifecycle-section";
import { OrganizationPreferencesEditor } from "./organization-preferences-editor";
import { OrganizationProfileEditor } from "./organization-profile-editor";
import { OrganizationSectionPage } from "./organization-section-page";
import { OrganizationSettingsForm } from "./organization-settings-form";

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
          <div className="flex flex-col gap-4">
            <AccordionSectionSkeleton rows={3} />
            <AccordionSectionSkeleton rows={2} />
            <AccordionSectionSkeleton rows={2} />
          </div>
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
            <OrganizationLifecycleSection />
          </>
        )}
      </div>
    </OrganizationSectionPage>
  );
}
