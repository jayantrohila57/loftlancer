import { OrganizationMembersPage } from "../components/client.organization-members.content";
import { OrganizationSectionPage } from "../components/client.organization-section.page";

export function OrganizationMembersPageView({ slug }: { slug: string }) {
  return (
    <OrganizationSectionPage
      slug={slug}
      title="Members"
      description="Invite teammates and manage organization roles."
    >
      <OrganizationMembersPage slug={slug} />
    </OrganizationSectionPage>
  );
}
