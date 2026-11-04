import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { FeaturesAccessSection } from "../sections/client.features-access.section";
import { FeaturesCapabilitiesSection } from "../sections/client.features-capabilities.section";
import { FeaturesIndexSection } from "../sections/client.features-index.section";
import { FeaturesProjectAppsSection } from "../sections/client.features-project-apps.section";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Explore Loftlancer organizations, project apps, role-based access, encrypted environments, and activity history.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <MarketingPage
      title="A workspace built around projects."
      description="Organize people and projects, set access by role, and manage encrypted environment variables alongside project tasks."
      aside={<FeaturesIndexSection />}
    >
      <FeaturesCapabilitiesSection />
      <FeaturesProjectAppsSection />
      <FeaturesAccessSection />
    </MarketingPage>
  );
}
