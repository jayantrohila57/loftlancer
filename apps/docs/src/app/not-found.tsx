import { buildSignInUrl } from "@loftlancer/ui/auth-links";
import { MarketingPageShell } from "@loftlancer/ui/marketing";
import { MarketingRouteState } from "@/components/marketing-route-state";
import { ModeToggle } from "@/components/mode-toggle";

export default function NotFound() {
  return (
    <MarketingPageShell
      signInHref={buildSignInUrl()}
      headerActions={<ModeToggle />}
    >
      <MarketingRouteState
        code="404"
        title="This page isn’t here."
        description="The address may have changed, or the page may no longer exist. Head back to the Loftlancer home page to find your way around."
        actionHref="/"
        actionLabel="Back to home"
        secondaryHref="/docs"
        secondaryLabel="Read the docs"
      />
    </MarketingPageShell>
  );
}
