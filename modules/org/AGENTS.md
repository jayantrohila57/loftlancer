# Module `org`

Organization product domain — provisioning, entitlements cache, and Better Auth hooks. **Docs:** [../../docs/work/requirements/organizations.md](../../docs/work/requirements/organizations.md)

| Path                                                 | Role                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `server/shared/org.membership-context.ts`            | `resolveActiveOrgMembershipContext` — session org + membership     |
| `server/shared/org.organization-plugin.ts`           | `organizationLimit`, `organizationHooks` via `configureBetterAuth` |
| `server/services/org.service.provisioning.ts`        | Post-create entitlement + storage root bootstrap                   |
| `server/repositories/org.repository.provisioning.ts` | Drizzle reads/writes for entitlement + storage root                |
