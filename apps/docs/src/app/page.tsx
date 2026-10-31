import { buildSignInUrl } from "@loftlancer/ui/auth-links";
import { MarketingLanding } from "@loftlancer/ui/marketing";
import { HomeJsonLd } from "@/components/json-ld";
import { ModeToggle } from "@/components/mode-toggle";
import { pageMetadata, siteDescription } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Loftlancer: organizations, projects and encrypted environments",
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <MarketingLanding
        signInHref={buildSignInUrl()}
        headerActions={<ModeToggle />}
      />
    </>
  );
}
