import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { project } from "./projects";

/** Per-user pinned projects (sidebar Favorites). */
export const projectPin = pgTable(
  "project_pin",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.projectId] }),
    index("project_pin_user_idx").on(table.userId, table.createdAt),
  ],
);
