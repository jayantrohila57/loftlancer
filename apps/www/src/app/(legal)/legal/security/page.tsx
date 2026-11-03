import SecurityPage from "@/components/legal/legal.security.view";
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

export default function SecurityPageRoute() {
  return <SecurityPage />;
}
