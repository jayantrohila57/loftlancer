import ContactPage from "@/components/legal/legal.contact.view";
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

export default function ContactPageRoute() {
  return <ContactPage />;
}
