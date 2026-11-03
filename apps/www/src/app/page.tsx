import { MarketingLanding } from "@features/marketing/core/client";
import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";
import { HomeJsonLd } from "@/components/json-ld";
import { pageMetadata, siteDescription } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Loftlancer: organizations, projects and encrypted environments",
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

const pagesBaseUrl =
  process.env.NEXT_PUBLIC_DOCS_URL?.trim() || "https://loftlancer.com";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { notice } = await searchParams;
  return (
    <>
      <HomeJsonLd />
      <MarketingLanding
        signInHref="/sign-in"
        headerActions={<ModeToggle />}
        pagesBaseUrl={pagesBaseUrl}
        accountDeleted={notice === "account-deleted"}
      />
    </>
  );
}
