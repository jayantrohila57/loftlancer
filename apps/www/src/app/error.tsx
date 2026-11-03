"use client";

import { MarketingPageShell } from "@features/marketing/core/client";
import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";
import { logger } from "@loftlancer/sentry";
import { useEffect } from "react";
import { MarketingRouteState } from "@/components/marketing-route-state";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Route error boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <MarketingPageShell signInHref="/sign-in" headerActions={<ModeToggle />}>
      <MarketingRouteState
        code="500"
        title="We couldn’t load this page."
        description="Something interrupted the page. Try again, or return to the Loftlancer home page."
        actionHref="/"
        actionLabel="Back to home"
        secondaryLabel="Try again"
        secondaryAction={reset}
      />
    </MarketingPageShell>
  );
}
