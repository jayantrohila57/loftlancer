import { SpeedInsights } from "@vercel/speed-insights/next"

/**
 * Vercel Speed Insights — Core Web Vitals and performance data in the Vercel dashboard.
 *
 * Pairs with {@link VercelWebAnalytics}; mount both via {@link VercelWebTelemetry}.
 */
export function VercelSpeedInsights() {
  return <SpeedInsights />
}
