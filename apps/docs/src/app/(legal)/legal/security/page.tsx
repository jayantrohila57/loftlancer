import { pageMetadata } from "@/lib/seo";
import SecurityPage from "@/module/legal/legal.security.view";

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
