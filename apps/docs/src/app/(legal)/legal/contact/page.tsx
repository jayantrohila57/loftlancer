import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "Contact",
    description:
      "How to reach Loftlancer for product support, legal or privacy requests.",
    path: "/legal/contact",
  }),
  // Placeholder copy: kept out of the index and sitemap until reviewed.
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      description="How to reach Loftlancer for product support, legal, and privacy requests."
      href="/legal/contact"
    >
      <p>
        For product support, sign in to your dashboard and open a ticket under
        Help. For legal or privacy requests, contact the repository owner listed
        on GitHub.
      </p>
    </LegalPage>
  );
}
