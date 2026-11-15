# Module `ai-usage`

Org-scoped Account **AI Usage** — entitlement cache reads, ledger history, deferred tabs. **Docs:** [../../docs/work/requirements/ai-usage-credits.md](../../docs/work/requirements/ai-usage-credits.md) · model breakdown draft [../../docs/work/requirements/ai-usage-model-breakdown.md](../../docs/work/requirements/ai-usage-model-breakdown.md) (AUTH-AI-MODEL-01 / item 118) · limits/alerts draft [../../docs/work/requirements/ai-usage-limits-alerts.md](../../docs/work/requirements/ai-usage-limits-alerts.md) (AUTH-AI-LIMIT-01) · blockers [../../docs/work/phase-9-product-decisions-request.md](../../docs/work/phase-9-product-decisions-request.md) batch **B**

| Path                            | Role                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| `server/ai-usage.controller.ts` | oRPC `overview`, `usageHistory`, `limitsAlertsGet`, `limitsAlertsUpdate` |
| `client/components/*`           | Overview, history (cursor pagination), limits prefs, model empty state   |
