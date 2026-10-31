"use client";

import { logger } from "@loftlancer/logger";
import { buildSignInUrl } from "@loftlancer/ui/auth-links";
import { MarketingPageShell } from "@loftlancer/ui/marketing";
import { useEffect } from "react";
import { MarketingRouteState } from "@/components/marketing-route-state";
import { ModeToggle } from "@/components/mode-toggle";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Route errors reach Sentry Logs (#355). Name, message and digest only.
  useEffect(() => {
    logger.error("Route error boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <MarketingPageShell
      signInHref={buildSignInUrl()}
      headerActions={<ModeToggle />}
    >
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
