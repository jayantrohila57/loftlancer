import PageContent from "@modules/www/client/www/components/client.legal-security.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";

export const metadata = {
  ...pageMetadata({
    title: "Security",
    description:
      "Security practices for the hosted Loftlancer platform. Final policy text is pending review.",
    path: "/legal/security",
  }),
  // Placeholder copy: kept out of the index and sitemap until reviewed.
  robots: { index: false, follow: true },
};

export default function SecurityPageRoute() {
  return <PageContent />;
}
