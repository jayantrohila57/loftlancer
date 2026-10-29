import { pageMetadata } from "@/lib/seo";
import FeaturesPage from "@/module/marketing/marketing.features.view";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Encryption, organizations, projects, project apps and activity in Loftlancer.",
  path: "/features",
});

export default function FeaturesPageRoute() {
  return <FeaturesPage />;
}
