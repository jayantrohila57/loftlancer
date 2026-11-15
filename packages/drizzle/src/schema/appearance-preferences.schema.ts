import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

/** Optional appearance preferences; null means the user has not selected a value. */
export const appearancePreferences = pgTable("appearance_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: text("theme"),
  interfaceDensity: text("interface_density"),
  sidebarBehavior: text("sidebar_behavior"),
  zoomLevel: text("zoom_level"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
