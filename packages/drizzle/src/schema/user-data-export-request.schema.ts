import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

/** Manual data-export requests (Phase 9 batch D2). */
export const userDataExportRequest = pgTable("user_data_export_request", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
