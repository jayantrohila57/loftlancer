import PageContent from "@modules/www/client/www/components/client.legal-dpa.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";

export const metadata = {
  ...pageMetadata({
    title: "Data processing agreement (DPA)",
    description:
      "Data processing terms (GDPR) for the hosted Loftlancer service, to be published after legal review.",
    path: "/legal/dpa",
  }),
  // Placeholder copy: kept out of the index and sitemap until reviewed.
  robots: { index: false, follow: true },
};

export default function DpaPageRoute() {
  return <PageContent />;
}
