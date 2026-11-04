/** Sends a GA4 event only after the consent-gated script has registered dataLayer. */
export function trackAnalyticsEvent(
  name: string,
  params: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === "undefined") return;
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (!dataLayer) return;
  dataLayer.push(["event", name, params]);
}
