import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

/** Marketing and analytics consents (Phase 9 batch D1). */
export const userPrivacyConsent = pgTable("user_privacy_consent", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  marketingEmailEnabled: boolean("marketing_email_enabled")
    .notNull()
    .default(false),
  analyticsEnabled: boolean("analytics_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
