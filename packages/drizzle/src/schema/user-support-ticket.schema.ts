import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

export const userSupportTicketStatus = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const

export type UserSupportTicketStatus = (typeof userSupportTicketStatus)[number]

/** Per-user support tickets created from the Auth account area. */
export const userSupportTicket = pgTable("user_support_ticket", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
