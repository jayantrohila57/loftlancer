import CookiesPage from "@/components/legal/legal.cookies.view";
import { pageMetadata } from "@/lib/seo";

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
  return <CookiesPage />;
}
