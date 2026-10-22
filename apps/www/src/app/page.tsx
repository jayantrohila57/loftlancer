import { MarketingLanding } from "@loftlancer/ui/marketing";
import { getSignInHref } from "@/lib/sign-in-href";

const pagesBaseUrl =
  process.env.NEXT_PUBLIC_DOCS_URL?.trim() || "https://loftlancer.com";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { notice } = await searchParams;
  return (
    <MarketingLanding
      signInHref={getSignInHref()}
      pagesBaseUrl={pagesBaseUrl}
      accountDeleted={notice === "account-deleted"}
    />
  );
}
