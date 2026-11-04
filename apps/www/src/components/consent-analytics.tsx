"use client";

import {
  AnalyticsConsentBanner,
  useAnalyticsConsent,
} from "@features/analytics/core/client";
import { gaMeasurementId } from "@modules/www/utils/utils.analytics-config.constants";
import { GoogleAnalytics } from "@next/third-parties/google";

/** App-level analytics integration; the public consent rules live in the analytics feature. */
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
