import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

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

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      description="Security practices for the hosted Loftlancer platform. Full policy text is pending review."
      href="/legal/security"
    >
      <p>
        Security practices for the hosted platform are documented in the docs
        site and deployment runbook. Final policy text is pending owner review.
      </p>
    </LegalPage>
  );
}
