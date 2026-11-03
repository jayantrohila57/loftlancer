import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./better-auth";

export const actionBlock = pgTable(
  "action_block",
  {
    id: text("id").primaryKey(),
    action: text("action").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: text("scope_id"),
    reason: text("reason"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("action_block_scope_idx").on(table.scopeType, table.scopeId),
    index("action_block_action_idx").on(table.action),
  ],
);
