import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

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

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable use"
      description="Acceptable use of the hosted Loftlancer service. Full terms are pending legal review."
      href="/legal/acceptable-use"
    >
      <p>
        Do not use Loftlancer to violate others&apos; rights, bypass
        authorization, or distribute malware. Full acceptable-use language will
        be added after legal review.
      </p>
    </LegalPage>
  );
}
