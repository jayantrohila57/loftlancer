import { OrganizationRolesPage } from "./organizations.roles.content";
import { OrganizationSectionPage } from "./organizations.section";

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
