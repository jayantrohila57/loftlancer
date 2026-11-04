import PageContent from "@modules/www/client/www/components/client.legal-cookies.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";

export const metadata = {
  ...pageMetadata({
    title: "Cookie policy",
    description:
      "How Loftlancer uses cookies and remembers your analytics choice.",
    path: "/legal/cookies",
  }),
  // Placeholder copy: kept out of the index and sitemap until reviewed.
  robots: { index: false, follow: true },
};

export default function CookiesPageRoute() {
  return <PageContent />;
}
