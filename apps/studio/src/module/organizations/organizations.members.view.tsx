import { OrganizationMembersPage } from "./organizations.members.content";
import { OrganizationSectionPage } from "./organizations.section";

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
