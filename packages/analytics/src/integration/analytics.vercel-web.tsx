import { Analytics } from "@vercel/analytics/next"

/**
 * Vercel Web Analytics — page views and traffic in the Vercel project dashboard.
 *
 * PostHog (product analytics: funnels, feature flags, session replay) is a separate
 * layer and may honor privacy consent. Mount both when PostHog is wired; they do not
 * duplicate each other's purpose. Prefer {@link VercelWebTelemetry} with Speed Insights.
 */
export function VercelWebAnalytics() {
  return <Analytics />
}
