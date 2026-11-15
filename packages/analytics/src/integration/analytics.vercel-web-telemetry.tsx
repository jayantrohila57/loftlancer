import { VercelSpeedInsights } from "./analytics.vercel-speed-insights"
import { VercelWebAnalytics } from "./analytics.vercel-web"

/**
 * Vercel Web Analytics + Speed Insights — mount once at the end of `<body>` (loftlancer pattern).
 */
export function VercelWebTelemetry() {
  return (
    <>
      <VercelWebAnalytics />
      <VercelSpeedInsights />
    </>
  )
}
