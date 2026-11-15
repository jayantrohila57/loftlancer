import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

/** Optional account preferences; null means the user has not selected a value. */
export const regionalPreferences = pgTable("regional_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  language: text("language"),
  region: text("region"),
  timeZone: text("time_zone"),
  dateStyle: text("date_style"),
  hourCycle: text("hour_cycle"),
  currency: text("currency"),
  numberGrouping: text("number_grouping"),
  measurementSystem: text("measurement_system"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
