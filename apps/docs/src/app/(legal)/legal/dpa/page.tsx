import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

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

export default function DpaPage() {
  return (
    <LegalPage title="Data processing agreement (DPA)">
      <p>
        Data processing terms for enterprise customers will be published here.
        Self-hosted operators remain responsible for their own data processing
        agreement obligations.
      </p>
    </LegalPage>
  );
}
