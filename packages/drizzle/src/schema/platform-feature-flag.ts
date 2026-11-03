import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./better-auth";

export const platformFeatureFlag = pgTable("platform_feature_flag", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
});
