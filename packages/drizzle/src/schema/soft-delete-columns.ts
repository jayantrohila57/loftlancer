import { text, timestamp } from "drizzle-orm/pg-core";

/** Shared nullable soft-delete columns (applied via combined migration). */
export const softDeleteColumns = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
};
