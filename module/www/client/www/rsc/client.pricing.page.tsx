import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { PricingFaqSection } from "../sections/client.pricing-faq.section";
import { PricingOfferSection } from "../sections/client.pricing-offer.section";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Loftlancer is free during early access. No paid plans or billing are available today.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <MarketingPage
      title="Free while Loftlancer is in early access."
      description="The current product is available at no cost, and no payment details are required. Paid plans and billing are not available today."
    >
      <PricingOfferSection />
      <PricingFaqSection />
    </MarketingPage>
  );
}
