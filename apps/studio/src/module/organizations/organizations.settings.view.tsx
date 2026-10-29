import { OrganizationSectionPage } from "./organizations.section";
import { OrganizationSettingsPage } from "./organizations.settings.content";

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
