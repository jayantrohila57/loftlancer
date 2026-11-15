"use client"

import { useAiUsageHistory } from "./ai-usage.hook.history"
import {
  useAiUsageLimitsAlerts,
  useAiUsageLimitsAlertsUpdate,
} from "./ai-usage.hook.limits-alerts"
import { useAiUsageOverview } from "./ai-usage.hook.overview"

export const useAiUsageApi = {
  useOverview: useAiUsageOverview,
  useUsageHistory: useAiUsageHistory,
  useLimitsAlerts: useAiUsageLimitsAlerts,
  useLimitsAlertsUpdate: useAiUsageLimitsAlertsUpdate,
}
