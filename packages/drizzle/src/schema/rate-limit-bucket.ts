import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Token-bucket counters for MCP (and other) rate limits — Decision 14. */
export const rateLimitBucket = pgTable("rate_limit_bucket", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
});
