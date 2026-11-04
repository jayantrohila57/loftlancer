import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { FeaturesAccessSection } from "../sections/client.features-access.section";
import { FeaturesCapabilitiesSection } from "../sections/client.features-capabilities.section";
import { FeaturesIndexSection } from "../sections/client.features-index.section";
import { FeaturesProjectAppsSection } from "../sections/client.features-project-apps.section";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Encryption, organizations, projects, project apps and activity in Loftlancer.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <MarketingPage
      title="People, projects, access."
      description="Organize teams and project apps, set access by role, and manage encrypted configuration from a shared workspace."
      aside={<FeaturesIndexSection />}
    >
      <FeaturesCapabilitiesSection />
      <FeaturesProjectAppsSection />
      <FeaturesAccessSection />
    </MarketingPage>
  );
}
