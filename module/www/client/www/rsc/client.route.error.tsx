"use client";

import { logger } from "@loftlancer/sentry";
import { MarketingRouteState } from "@modules/www/client/www/components/client.route-state.component";
import { useEffect } from "react";
import WwwLayout from "../layout/client.www.layout";

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
    <WwwLayout>
      <MarketingRouteState
        code="500"
        title="We couldn’t load this page."
        description="Something interrupted the page. Try again, or return to the Loftlancer home page."
        actionHref="/"
        actionLabel="Back to home"
        secondaryLabel="Try again"
        secondaryAction={reset}
      />
    </WwwLayout>
  );
}
