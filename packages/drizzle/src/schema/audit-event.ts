import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { organization } from "./organization";
import { environment, project } from "./projects";

export const auditEvent = pgTable(
  "audit_event",
  {
    id: text("id").primaryKey(),
    action: text("action").notNull(),
    result: text("result").notNull(),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "set null",
    }),
    environmentId: text("environment_id").references(() => environment.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    entitySlug: text("entity_slug"),
    targetUserId: text("target_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    denialReason: text("denial_reason"),
    errorCode: text("error_code"),
    payload: jsonb("payload").notNull().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    durationMs: integer("duration_ms"),
    /** `trpc` | `mcp` | `auth` | … */
    source: text("source").notNull().default("trpc"),
    oauthClientId: text("oauth_client_id"),
    mcpTool: text("mcp_tool"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_event_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("audit_event_actor_created_idx").on(
      table.actorUserId,
      table.createdAt,
    ),
    index("audit_event_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
    index("audit_event_action_created_idx").on(table.action, table.createdAt),
    index("audit_event_source_created_idx").on(table.source, table.createdAt),
  ],
);

export const auditEventRelations = relations(auditEvent, ({ one }) => ({
  actor: one(user, {
    fields: [auditEvent.actorUserId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [auditEvent.organizationId],
    references: [organization.id],
  }),
  project: one(project, {
    fields: [auditEvent.projectId],
    references: [project.id],
  }),
}));
