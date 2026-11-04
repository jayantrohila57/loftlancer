import { LegalPolicyNav } from "@modules/www/client/www/components/client.legal-navigation.component";
import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { PrivacyDataSection } from "../sections/client.privacy-data.section";
import { PrivacyProvidersSection } from "../sections/client.privacy-providers.section";

export const metadata = pageMetadata({
  title: "Privacy",
  description: "How Loftlancer handles account and configuration data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <MarketingPage
      title="Privacy policy"
      description="Last updated October 2026. This describes product behavior reflected in the codebase."
      aside={<LegalPolicyNav currentHref="/privacy" />}
    >
      <PrivacyDataSection />
      <PrivacyProvidersSection />
    </MarketingPage>
  );
}
