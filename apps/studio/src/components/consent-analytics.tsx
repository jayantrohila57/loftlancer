"use client";

import {
  AnalyticsConsentBanner,
  useAnalyticsConsent,
} from "@features/analytics/core/client";
import { useEffect } from "react";
import { applyPostHogConsent, posthogKey } from "@/lib/posthog";

/**
 * PostHog product analytics, gated twice: nothing happens until
 * NEXT_PUBLIC_POSTHOG_KEY is set at build time, and then it loads only after
 * the user accepts the consent banner. Withdrawing consent opts PostHog out
 * on the same page; granting it again opts back in.
 */
export function ConsentAnalytics() {
  const [consent] = useAnalyticsConsent();

  useEffect(() => {
    if (posthogKey) applyPostHogConsent(consent);
  }, [consent]);

  if (!posthogKey) return null;
  return <AnalyticsConsentBanner />;
}
