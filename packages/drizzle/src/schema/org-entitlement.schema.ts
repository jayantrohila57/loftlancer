import { relations } from "drizzle-orm"
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { organization } from "./organization.schema"

/** Drizzle cache of Autumn plan limits and flags (one row per org). */
export const orgEntitlement = pgTable(
  "org_entitlement",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    planTier: text("plan_tier", { enum: ["free", "paid"] })
      .notNull()
      .default("free"),
    subscriptionStatus: text("subscription_status", {
      enum: ["active", "past_due", "canceled", "trialing", "incomplete"],
    })
      .notNull()
      .default("active"),
    quotaBytes: bigint("quota_bytes", { mode: "number" })
      .notNull()
      .default(2_147_483_648),
    aiEnabled: boolean("ai_enabled").notNull().default(false),
    aiCreditBalance: integer("ai_credit_balance").notNull().default(0),
    storageCreditBalance: integer("storage_credit_balance")
      .notNull()
      .default(0),
    autumnCustomerId: text("autumn_customer_id").unique(),
    entitlementsSyncedAt: timestamp("entitlements_synced_at"),
    entitlementsDegraded: boolean("entitlements_degraded")
      .notNull()
      .default(false),
    subscriptionRevision: integer("subscription_revision").notNull().default(0),
    orgProvisioningStep: text("org_provisioning_step", {
      enum: [
        "created",
        "storage_root",
        "entitlement_cache",
        "autumn_bound",
        "complete",
      ],
    })
      .notNull()
      .default("created"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("org_entitlement_autumn_customer_uidx").on(
      table.autumnCustomerId
    ),
    index("org_entitlement_plan_tier_idx").on(table.planTier),
  ]
)

export const orgEntitlementRelations = relations(orgEntitlement, ({ one }) => ({
  organization: one(organization, {
    fields: [orgEntitlement.organizationId],
    references: [organization.id],
  }),
}))
