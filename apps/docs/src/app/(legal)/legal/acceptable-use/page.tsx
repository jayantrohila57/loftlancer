import { pageMetadata } from "@/lib/seo";
import AcceptableUsePage from "@/module/legal/legal.acceptable-use.view";

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

export default function AcceptableUsePageRoute() {
  return <AcceptableUsePage />;
}
