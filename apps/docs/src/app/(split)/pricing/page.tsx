import { pageMetadata } from "@/lib/seo";
import PricingPage from "@/module/marketing/marketing.pricing.view";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Loftlancer is free during early access. No paid plans exist yet.",
  path: "/pricing",
});

export default function PricingPageRoute() {
  return <PricingPage />;
}
