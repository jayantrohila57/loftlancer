import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";
import { AboutLinksSection } from "../sections/client.about-links.section";
import { AboutPrinciplesSection } from "../sections/client.about-principles.section";
import { AboutStorySection } from "../sections/client.about-story.section";

export const metadata = pageMetadata({
  title: "About",
  description:
    "A collaborative workspace for encrypted project configuration and team access.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <MarketingPage
      title="About Loftlancer"
      description="Loftlancer brings project structure, team access, and encrypted configuration into one shared place."
    >
      <AboutStorySection />
      <AboutPrinciplesSection />
      <AboutLinksSection />
    </MarketingPage>
  );
}
