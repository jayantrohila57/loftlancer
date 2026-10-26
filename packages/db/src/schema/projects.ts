import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organization";
import { environmentVariableTypeEnum } from "./variable-type";

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    purpose: text("purpose"),
    documentationUrl: text("documentation_url"),
    startDate: date("start_date"),
    targetDate: date("target_date"),
    isArchived: boolean("is_archived").default(false).notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    repositoryUrl: text("repository_url"),
    websiteUrl: text("website_url"),
    status: varchar("status", {
      length: 50,
      enum: ["active", "inactive", "maintenance"],
    })
      .default("active")
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    check(
      "project_purpose_length_check",
      sql`${table.purpose} IS NULL OR length(${table.purpose}) <= 500`,
    ),
    check(
      "project_documentation_url_length_check",
      sql`${table.documentationUrl} IS NULL OR length(${table.documentationUrl}) <= 2048`,
    ),
    check(
      "project_dates_order_check",
      sql`${table.startDate} IS NULL OR ${table.targetDate} IS NULL OR ${table.targetDate} >= ${table.startDate}`,
    ),
    // Per-org slugs (#301): URLs are /[org]/[project].
    uniqueIndex("project_org_slug_active_uidx")
      .on(table.organizationId, table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    // Access links reference this pair so their organization must match the
    // project even when writes bypass the application layer.
    unique("project_id_organization_id_uq").on(table.id, table.organizationId),
    index("project_userId_idx").on(table.userId),
    index("project_slug_idx").on(table.slug),
    index("project_status_idx").on(table.status),
    index("project_isArchived_idx").on(table.isArchived),
    index("project_organization_id_idx").on(table.organizationId),
  ],
);

export const environment = pgTable(
  "environment",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(), // dev, staging, prod
    slug: varchar("slug", { length: 255 }).notNull(),
    branch: text("branch"), // git branch name
    deployedUrl: text("deployed_url"), // deployed application URL
    status: varchar("status", {
      length: 50,
      enum: ["active", "inactive", "building", "failed"],
    })
      .default("active")
      .notNull(),
    isProduction: boolean("is_production").default(false).notNull(),
    description: text("description"),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("environment_project_slug_active_uidx")
      .on(table.projectId, table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    index("environment_projectId_idx").on(table.projectId),
    index("environment_slug_idx").on(table.slug),
    index("environment_status_idx").on(table.status),
    index("environment_branch_idx").on(table.branch),
  ],
);

export const environmentVariable = pgTable(
  "environment_variable",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    encryptedValue: text("encrypted_value").notNull(),
    type: environmentVariableTypeEnum("type").default("secret").notNull(),
    note: text("note"),
    environmentId: text("environment_id")
      .notNull()
      .references(() => environment.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("environment_variable_env_key_active_uidx")
      .on(table.environmentId, table.key)
      .where(sql`${table.deletedAt} IS NULL`),
    index("environment_variable_environmentId_idx").on(table.environmentId),
    index("environment_variable_key_idx").on(table.key),
  ],
);

// Relations
export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
  environments: many(environment),
  variables: many(environmentVariable),
}));

export const environmentRelations = relations(environment, ({ one, many }) => ({
  project: one(project, {
    fields: [environment.projectId],
    references: [project.id],
  }),
  variables: many(environmentVariable),
  createdByUser: one(user, {
    fields: [environment.createdBy],
    references: [user.id],
    relationName: "environmentCreatedBy",
  }),
  updatedByUser: one(user, {
    fields: [environment.updatedBy],
    references: [user.id],
    relationName: "environmentUpdatedBy",
  }),
}));

export const environmentVariableRelations = relations(
  environmentVariable,
  ({ one }) => ({
    environment: one(environment, {
      fields: [environmentVariable.environmentId],
      references: [environment.id],
    }),
    createdByUser: one(user, {
      fields: [environmentVariable.createdBy],
      references: [user.id],
      relationName: "variableCreatedBy",
    }),
    updatedByUser: one(user, {
      fields: [environmentVariable.updatedBy],
      references: [user.id],
      relationName: "variableUpdatedBy",
    }),
  }),
);
