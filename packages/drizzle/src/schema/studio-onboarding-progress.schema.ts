import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { user } from "./auth.schema"

/** Per-user studio create-org wizard progress (plan / invite after org exists). */
export const studioOnboardingProgress = pgTable("studio_onboarding_progress", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  completedSteps: jsonb("completed_steps")
    .$type<readonly string[]>()
    .default([])
    .notNull(),
  finishedAt: timestamp("finished_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})
