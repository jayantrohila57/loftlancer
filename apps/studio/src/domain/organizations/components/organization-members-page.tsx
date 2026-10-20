"use client";

import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import { ErrorState } from "@/components/patterns/error-state";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";
import { OrganizationSettingsForm } from "./organization-settings-form";

export function OrganizationMembersPage({ slug }: { slug: string }) {
  const { organization, status, error, reload } = useOrganizationBySlug(slug);

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Members"
      description="Invite teammates and manage organization roles."
      peopleNavigation
    >
      {status === "error" ? (
        <ErrorState
          title="Could not load organization"
          description={error?.message ?? "Try loading the organization again."}
          onRetry={() => void reload()}
        />
      ) : status === "loading" || !organization ? (
        <SettingsPanelSkeleton rows={4} />
      ) : (
        <OrganizationSettingsForm
          key={organization.id}
          organizationId={organization.id}
          mode="members"
        />
      )}
    </OrganizationSectionPage>
  );
}
