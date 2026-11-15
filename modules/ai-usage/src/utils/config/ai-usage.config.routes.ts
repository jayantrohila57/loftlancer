export const aiUsageRoutes = {
  overview: {
    method: "POST" as const,
    path: "/openapi/security/ai-usage/overview" as const,
    summary: "Organization AI usage overview",
    description:
      "Returns org-scoped AI entitlement cache: plan gate, credit balance, and invoke readiness (no metered routes in v1).",
    tags: ["AI Usage"],
  },
  usageHistory: {
    method: "POST" as const,
    path: "/openapi/security/ai-usage/usage-history" as const,
    summary: "Organization AI credit ledger history",
    description:
      "Returns recent settled AI credit ledger rows for the active organization (empty until first metered invoke).",
    tags: ["AI Usage"],
  },
  limitsAlertsGet: {
    method: "POST" as const,
    path: "/openapi/security/ai-usage/limits-alerts/get" as const,
    summary: "Organization AI usage alert preferences",
    description:
      "Read preset balance alert toggles and optional monthly spend cap.",
    tags: ["AI Usage"],
  },
  limitsAlertsUpdate: {
    method: "POST" as const,
    path: "/openapi/security/ai-usage/limits-alerts/update" as const,
    summary: "Update organization AI usage alert preferences",
    description:
      "Owner-only: preset threshold toggles and optional monthly spend cap.",
    tags: ["AI Usage"],
  },
} as const
