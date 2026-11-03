"use client";

import { Auth5Panel } from "@features/authentication/core/client";
import { AppRouteErrorPage } from "@features/patterns/core/client/patterns.app-route-states";
import { logger } from "@loftlancer/sentry";
import { useEffect } from "react";

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
    <Auth5Panel showTerms={false}>
      <AppRouteErrorPage error={error} reset={reset} />
    </Auth5Panel>
  );
}
