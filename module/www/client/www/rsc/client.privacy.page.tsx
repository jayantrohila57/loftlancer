import {
  LegalPolicyNav,
  LegalReviewNotice,
} from "@modules/www/client/www/components/client.legal-navigation.component";
import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { PrivacyDataSection } from "../sections/client.privacy-data.section";
import { PrivacyProvidersSection } from "../sections/client.privacy-providers.section";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "What account, organization, project, and configuration data Loftlancer handles and which services support the hosted product.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <MarketingPage
      title="Privacy policy"
      description="Last updated November 2026. Product and provider details describe the current hosted setup."
      aside={<LegalPolicyNav currentHref="/privacy" />}
    >
      <LegalReviewNotice />
      <PrivacyDataSection />
      <PrivacyProvidersSection />
    </MarketingPage>
  );
}
