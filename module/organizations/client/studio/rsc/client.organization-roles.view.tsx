import { OrganizationRolesPage } from "../components/client.organization-roles.content";
import { OrganizationSectionPage } from "../components/client.organization-section.page";

export function OrganizationRolesPageView({ slug }: { slug: string }) {
  return (
    <OrganizationSectionPage
      slug={slug}
      title="Roles & access"
      description="Organization roles and permission policies."
    >
      <OrganizationRolesPage slug={slug} />
    </OrganizationSectionPage>
  );
}
