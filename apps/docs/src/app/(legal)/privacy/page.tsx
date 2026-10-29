import { pageMetadata } from "@/lib/seo";
import PrivacyPage from "@/module/legal/legal.privacy.view";

export const metadata = pageMetadata({
  title: "Privacy",
  description: "How Loftlancer handles account and configuration data.",
  path: "/privacy",
});

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}
