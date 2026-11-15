# Package `billing`

Autumn server client, feature/plan constants, org customer binding, webhook ingestion, and **Autumn → Drizzle** entitlement cache sync. Folder **`billing`** → **`@packages/billing`**.

**Docs:** [../../docs/work/requirements/autumn-usage-metering.md](../../docs/work/requirements/autumn-usage-metering.md)

| Path                                          | Role                                          |
| --------------------------------------------- | --------------------------------------------- |
| `src/integration/billing.autumn-client.ts`    | Shared `Autumn` SDK instance (`AUTUMN_*` env) |
| `src/integration/billing.constants.ts`        | Feature IDs, plan IDs, quota bytes            |
| `src/integration/billing.customer-bind.ts`    | Idempotent org → Autumn customer bind         |
| `src/integration/billing.entitlement-sync.ts` | Map Autumn customer → `org_entitlement` row   |
| `src/integration/billing.webhook.ts`          | Signed webhook handler + event journal        |
