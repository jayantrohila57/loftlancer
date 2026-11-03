import { OrganizationSectionPage } from "../components/client.organization-section.page";
import { OrganizationSettingsPage } from "../components/client.organization-settings.content";

export function OrganizationSettingsPageView({ slug }: { slug: string }) {
  return (
    <OrganizationSectionPage
      slug={slug}
      title="Organization settings"
      description="Organization identity, profile, and lifecycle."
    >
      <OrganizationSettingsPage slug={slug} />
    </OrganizationSectionPage>
  );
}
