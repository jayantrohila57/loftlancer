import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organization";
import { project } from "./projects";

/** Per-organization model allowlist and token budget for AI Gateway calls. */
export const organizationAiPolicy = pgTable(
  "organization_ai_policy",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    allowedModels: jsonb("allowed_models")
      .$type<string[]>()
      .notNull()
      .default(sql`'["openai/gpt-4.1-mini"]'::jsonb`),
    monthlyTokenLimit: integer("monthly_token_limit")
      .notNull()
      .default(100_000),
    monthlyTokensUsed: integer("monthly_tokens_used").notNull().default(0),
    periodStartedAt: timestamp("period_started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check(
      "organization_ai_policy_limit_check",
      sql`${table.monthlyTokenLimit} >= 0`,
    ),
    check(
      "organization_ai_policy_used_check",
      sql`${table.monthlyTokensUsed} >= 0`,
    ),
  ],
);

/** Immutable metering record; prompts and outputs deliberately are never stored. */
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "set null",
    }),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    gatewayCallId: text("gateway_call_id").notNull().unique(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    finishReason: text("finish_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("ai_usage_input_tokens_check", sql`${table.inputTokens} >= 0`),
    check("ai_usage_output_tokens_check", sql`${table.outputTokens} >= 0`),
    check("ai_usage_total_tokens_check", sql`${table.totalTokens} >= 0`),
    index("ai_usage_org_created_idx").on(table.organizationId, table.createdAt),
    index("ai_usage_project_created_idx").on(table.projectId, table.createdAt),
  ],
);

export const organizationAiPolicyRelations = relations(
  organizationAiPolicy,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationAiPolicy.organizationId],
      references: [organization.id],
    }),
  }),
);
