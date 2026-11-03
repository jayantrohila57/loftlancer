"use client";

import { Auth5Content, Auth5Frame } from "@features/authentication/core/client";
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
    <Auth5Frame>
      <Auth5Content>
        <AppRouteErrorPage error={error} reset={reset} />
      </Auth5Content>
    </Auth5Frame>
  );
}
