import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { AboutLinksSection } from "../sections/client.about-links.section";
import { AboutPrinciplesSection } from "../sections/client.about-principles.section";
import { AboutStorySection } from "../sections/client.about-story.section";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Learn how Loftlancer organizes teams, projects, access, environments, and task work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <MarketingPage
      title="About Loftlancer"
      description="Loftlancer is a shared workspace for organizing teams and projects, managing access, protecting environment variables, and tracking project tasks."
    >
      <AboutStorySection />
      <AboutPrinciplesSection />
      <AboutLinksSection />
    </MarketingPage>
  );
}
