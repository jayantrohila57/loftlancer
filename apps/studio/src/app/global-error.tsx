"use client";

import "../index.css";
import { Auth5Content, Auth5Frame } from "@features/authentication/core/client";
import { AppGlobalErrorPage } from "@features/patterns/core/client/patterns.app-route-states";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <AppGlobalErrorPage
      error={error}
      reset={reset}
      frame={(card) => (
        <Auth5Frame>
          <Auth5Content>{card}</Auth5Content>
        </Auth5Frame>
      )}
    />
  );
}
