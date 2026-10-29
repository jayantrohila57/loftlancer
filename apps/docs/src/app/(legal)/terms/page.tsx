import { pageMetadata } from "@/lib/seo";
import TermsPage from "@/module/legal/legal.terms.view";

export const metadata = pageMetadata({
  title: "Terms",
  description: "Terms of use for the hosted Loftlancer service.",
  path: "/terms",
});

export default function TermsPageRoute() {
  return <TermsPage />;
}
