import type { orgEntitlement } from "@packages/drizzle/schema"

export type OrgProvisioningStep =
  (typeof orgEntitlement.$inferSelect)["orgProvisioningStep"]

export type OrgEntitlementRecord = typeof orgEntitlement.$inferSelect
