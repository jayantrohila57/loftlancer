import { MarketingPageShell } from "@features/marketing/core/client";
import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";
import { MarketingRouteState } from "@/components/marketing-route-state";

export default function NotFound() {
  return (
    <MarketingPageShell signInHref="/sign-in" headerActions={<ModeToggle />}>
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
