import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { organization } from "./organization.schema"

/** Per-org AI alert thresholds and optional monthly spend cap (Phase 9 batch L). */
export const orgAiUsagePolicy = pgTable("org_ai_usage_policy", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  alertLowBalanceEnabled: boolean("alert_low_balance_enabled")
    .notNull()
    .default(true),
  alertVeryLowBalanceEnabled: boolean("alert_very_low_balance_enabled")
    .notNull()
    .default(true),
  alertDepletedEnabled: boolean("alert_depleted_enabled")
    .notNull()
    .default(true),
  monthlySpendCapEnabled: boolean("monthly_spend_cap_enabled")
    .notNull()
    .default(false),
  monthlySpendCapCredits: integer("monthly_spend_cap_credits"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
