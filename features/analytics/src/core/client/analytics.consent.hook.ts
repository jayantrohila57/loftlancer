"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { AnalyticsConsent } from "../../types/analytics.consent.types";
import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  writeAnalyticsConsent,
} from "../../utils/analytics.consent.utils";

/** Current consent, or `null` while rendering on the server / before hydration. */
export function useAnalyticsConsent(): [
  AnalyticsConsent | null,
  (value: "granted" | "denied") => void,
] {
  const consent = useSyncExternalStore<AnalyticsConsent | null>(
    subscribeAnalyticsConsent,
    readAnalyticsConsent,
    () => null,
  );
  const set = useCallback((value: "granted" | "denied") => {
    writeAnalyticsConsent(value);
  }, []);
  return [consent, set];
}
