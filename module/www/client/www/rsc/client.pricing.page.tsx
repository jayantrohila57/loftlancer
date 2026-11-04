import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { PricingFaqSection } from "../sections/client.pricing-faq.section";
import { PricingOfferSection } from "../sections/client.pricing-offer.section";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Loftlancer is free during early access. No paid plans exist yet.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <MarketingPage
      title="Free during early access."
      description="Every current feature is available at no cost. Billing and paid plans are not available today."
    >
      <PricingOfferSection />
      <PricingFaqSection />
    </MarketingPage>
  );
}
