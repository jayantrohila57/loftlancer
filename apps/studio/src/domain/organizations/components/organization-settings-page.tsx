"use client";

import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";
import { OrganizationSettingsForm } from "./organization-settings-form";

export function OrganizationSettingsPage({ slug }: { slug: string }) {
  const { organization, status } = useOrganizationBySlug(slug);

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Organization settings"
      description="Workspace profile, slug, and danger zone."
    >
      <div className="flex flex-col gap-4">
        {status === "loading" || !organization ? (
          <SettingsPanelSkeleton rows={4} />
        ) : (
          <OrganizationSettingsForm
            key={organization.id}
            organizationId={organization.id}
            mode="settings-hub"
          />
        )}
      </div>
    </OrganizationSectionPage>
  );
}
