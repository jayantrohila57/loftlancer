import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

/** Per-user email notification category toggles (Phase 9 batch C). */
export const userNotificationPreference = pgTable(
  "user_notification_preference",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    billingEmailEnabled: boolean("billing_email_enabled")
      .notNull()
      .default(true),
    organizationInvitesEnabled: boolean("organization_invites_enabled")
      .notNull()
      .default(true),
    productEmailEnabled: boolean("product_email_enabled")
      .notNull()
      .default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
)
