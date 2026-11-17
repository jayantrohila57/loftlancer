import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

/** Terms and Privacy acceptance recorded at account creation. */
export const userLegalAcceptance = pgTable("user_legal_acceptance", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  termsVersion: text("terms_version").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
