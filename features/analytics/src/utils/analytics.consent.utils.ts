import { ANALYTICS_CONSENT_KEY } from "../constants/analytics.consent.constants";
import type { AnalyticsConsent } from "../types/analytics.consent.types";

const listeners = new Set<() => void>();

export function parseAnalyticsConsentValue(
  value: string | null | undefined,
): AnalyticsConsent {
  return value === "granted" || value === "denied" ? value : "unset";
}

export function readAnalyticsConsent(): AnalyticsConsent {
  try {
    return parseAnalyticsConsentValue(
      window.localStorage.getItem(ANALYTICS_CONSENT_KEY),
    );
  } catch {
    return "unset";
  }
}

export function subscribeAnalyticsConsent(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === ANALYTICS_CONSENT_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function writeAnalyticsConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  for (const listener of listeners) listener();
}
