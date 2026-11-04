import { CallToAction, PageContainer } from "@features/marketing/core/client";
import {
  pageMetadata,
  siteDescription,
} from "../../../utils/utils.seo-metadata.utils";
import { WwwFooter } from "../layout/client.www-footer.layout";
import { WwwHeader } from "../layout/client.www-header.layout";
import { HomeCapabilitiesSection } from "../sections/client.home-capabilities.section";
import { HomeCollaborationSection } from "../sections/client.home-collaboration.section";
import { HomeConnectionsSection } from "../sections/client.home-connections.section";
import { HomeFaqSection } from "../sections/client.home-faq.section";
import { HomeHeroSection } from "../sections/client.home-hero.section";
import { HomePricingSection } from "../sections/client.home-pricing.section";
import { HomeShowcaseSection } from "../sections/client.home-showcase.section";

export const metadata = pageMetadata({
  title: "Loftlancer: organizations, projects and encrypted environments",
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { notice } = await searchParams;
  const signInHref = "/sign-in";
  const accountDeleted = notice === "account-deleted";
  return (
    <div
      data-testid="marketing-landing"
      className="bg-background flex min-h-svh flex-col"
    >
      <WwwHeader />
      {accountDeleted ? (
        <PageContainer className="pt-4">
          <div
            role="status"
            aria-live="polite"
            className="border-foreground/60 bg-muted/30 border-l-2 px-4 py-3 text-sm"
          >
            <p className="font-medium">Your account was deleted.</p>
            <p className="text-muted-foreground mt-1 max-w-4xl leading-6">
              Your profile was anonymized and your sessions were revoked.
              Organization, project, and audit records remain, with no automatic
              removal date currently set. You cannot restore this profile
              yourself; sign in with a different account to continue.
            </p>
          </div>
        </PageContainer>
      ) : null}
      <main className="flex-1">
        <HomeHeroSection signInHref={signInHref} />
        <HomeCapabilitiesSection />
        <HomeShowcaseSection />
        <HomeCollaborationSection />
        <HomeConnectionsSection />
        <HomePricingSection />
        <PageContainer>
          <HomeFaqSection />
        </PageContainer>
        <CallToAction
          title="Bring your projects and team into one workspace."
          description="Create an organization, invite your team, and keep project access and configuration together."
          href={signInHref}
          actionLabel="Open your workspace"
        />
      </main>
      <WwwFooter />
    </div>
  );
}
