import PageContent from "@modules/www/client/www/components/client.legal-acceptable-use.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";

export const metadata = {
  ...pageMetadata({
    title: "Acceptable use",
    description:
      "Acceptable use of the hosted Loftlancer service. Full terms follow legal review.",
    path: "/legal/acceptable-use",
  }),
  // Placeholder copy: kept out of the index and sitemap until reviewed.
  robots: { index: false, follow: true },
};

export default function AcceptableUsePageRoute() {
  return <PageContent />;
}
