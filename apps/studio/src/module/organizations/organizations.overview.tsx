import { isPersonalOrganization } from "@/lib/org-personal";
import { OrganizationOverviewSections } from "./organizations.overview.sections";
import { OrganizationSectionPage } from "./organizations.section";

interface OrganizationOverviewProps {
  slug: string;
  metadata: string | null;
}

export function OrganizationOverview({
  slug,
  metadata,
}: OrganizationOverviewProps) {
  const personal = isPersonalOrganization({ metadata });

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Overview"
      description={
        personal
          ? "Personal organization overview and settings."
          : "Organization overview and settings."
      }
    >
      <OrganizationOverviewSections slug={slug} />
    </OrganizationSectionPage>
  );
}
