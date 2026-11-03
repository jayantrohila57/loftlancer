import { sendGAEvent } from "@next/third-parties/google";

/** GA4 measurement id, public site only (#351). Unset = no banner, no script. */
const rawGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const gaMeasurementId = /^G-[A-Z0-9]+$/.test(rawGaId) ? rawGaId : "";

/**
 * Custom GA4 event through the official `sendGAEvent`. A no-op until GA is
 * configured and loaded (i.e. the visitor accepted the consent banner).
 */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {},
): void {
  if (!gaMeasurementId || typeof window === "undefined") return;
  if (!(window as { dataLayer?: unknown[] }).dataLayer) return;
  sendGAEvent("event", name, params);
}
