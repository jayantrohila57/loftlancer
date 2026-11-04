"use client";

import {
  AnalyticsConsentBanner,
  useAnalyticsConsent,
} from "@features/analytics/core/client";
import { GoogleAnalytics } from "@next/third-parties/google";

import { gaMeasurementId } from "@/lib/analytics";

/**
 * Google Analytics 4 via the official `@next/third-parties/google` component,
 * gated twice (#351): nothing renders until NEXT_PUBLIC_GA_MEASUREMENT_ID is
 * set at build time, and the GA script loads only after the visitor accepts
 * the consent banner. Vercel Analytics and Speed Insights are separate.
 */
export function ConsentAnalytics() {
  const [consent] = useAnalyticsConsent();
  if (!gaMeasurementId) return null;

  return (
    <>
      <AnalyticsConsentBanner />
      {consent === "granted" ? (
        <GoogleAnalytics gaId={gaMeasurementId} />
      ) : null}
    </>
  );
}
