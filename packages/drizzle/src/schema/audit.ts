import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { environment, environmentVariable, project } from "./projects";

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "cascade",
    }),
    environmentId: text("environment_id").references(() => environment.id, {
      onDelete: "cascade",
    }),
    variableId: text("variable_id").references(() => environmentVariable.id, {
      onDelete: "cascade",
    }),
    action: text("action").notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'BULK_IMPORT', 'EXPORT', 'DEPLOY', 'ARCHIVE'
    entityType: text("entity_type").notNull(), // 'VARIABLE', 'ENVIRONMENT', 'PROJECT', 'USER'
    entitySlug: text("entity_slug"), // slug of the affected entity for easy identification
    oldValue: text("old_value"), // JSON of previous state
    newValue: text("new_value"), // JSON of new state
    ipAddress: text("ip_address"), // user IP address for security
    userAgent: text("user_agent"), // browser/client information
    metadata: text("metadata"), // additional context as JSON
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_userId_idx").on(table.userId),
    index("audit_log_projectId_idx").on(table.projectId),
    index("audit_log_environmentId_idx").on(table.environmentId),
    index("audit_log_createdAt_idx").on(table.createdAt),
    index("audit_log_action_idx").on(table.action),
    index("audit_log_entityType_idx").on(table.entityType),
    index("audit_log_entitySlug_idx").on(table.entitySlug),
  ],
);

// Relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [auditLog.projectId],
    references: [project.id],
  }),
  environment: one(environment, {
    fields: [auditLog.environmentId],
    references: [environment.id],
  }),
  variable: one(environmentVariable, {
    fields: [auditLog.variableId],
    references: [environmentVariable.id],
  }),
}));
