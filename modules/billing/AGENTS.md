# Module `billing`

Org-scoped subscription UI and oRPC (owner-only). **Docs:** [../../docs/work/requirements/autumn-usage-metering.md](../../docs/work/requirements/autumn-usage-metering.md)

| Path                                  | Role                            |
| ------------------------------------- | ------------------------------- |
| `server/shared/billing.procedure.ts`  | Active org + **owner** gate     |
| `server/billing.controller.ts`        | oRPC overview, upgrade, portal  |
| `client/components/billing.overview*` | Account Billing overview screen |
