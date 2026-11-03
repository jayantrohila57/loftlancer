"use client";

import { LoftlancerImpersonationBanner } from "@features/authentication/core/client";
import { OfflineBanner } from "@features/patterns/core/client/patterns.offline-banner";
import { SkipLink } from "@features/patterns/core/client/patterns.skip-link";
import { DirectionProvider } from "@loftlancer/ui/direction";
import { ThemeProvider } from "@loftlancer/ui/theme-provider";
import { ToastProvider } from "@loftlancer/ui/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { PostHogUser } from "@/components/posthog-user";
import { SentryUser } from "@/components/sentry-user";
import { authClient } from "@/lib/auth-client";
import {
  getClientErrorMessage,
  isBenignClientError,
} from "@/lib/errors/client-errors";
import { posthogKey } from "@/lib/posthog";
import { toast } from "@/lib/toast";
import { createTrpcClient, getQueryClient, TRPCProvider } from "@/utils/trpc";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const [trpcClient] = useState(() => createTrpcClient());

  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isBenignClientError(event.reason)) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      toast.error(
        getClientErrorMessage(event.reason, "An unexpected error occurred."),
      );
    };
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <DirectionProvider direction="ltr">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider position="bottom-left">
              <SkipLink />
              <LoftlancerImpersonationBanner authClient={authClient} />
              <OfflineBanner />
              {/* Sentry stays off without a DSN (#339); skip the session hook too. */}
              {process.env.NEXT_PUBLIC_SENTRY_DSN ? <SentryUser /> : null}
              {/* PostHog stays off without a key (#353); skip the session hook too. */}
              {posthogKey ? <PostHogUser /> : null}
              {children}
              <ReactQueryDevtools />
            </ToastProvider>
          </ThemeProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </TRPCProvider>
  );
}
