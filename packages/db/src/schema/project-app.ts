import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organization";
import { project } from "./projects";

/** Installed first-party apps per project (apps system, #245). */
export const projectApp = pgTable(
  "project_app",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull(),
    appVersion: integer("app_version").notNull().default(1),
    /** active | uninstalled | purged */
    status: text("status").notNull().default("active"),
    settings: jsonb("settings").notNull().default(sql`'{}'::jsonb`),
    installedBy: text("installed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    installedAt: timestamp("installed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    uninstalledBy: text("uninstalled_by").references(() => user.id, {
      onDelete: "set null",
    }),
    uninstalledAt: timestamp("uninstalled_at", { withTimezone: true }),
    purgeAfter: timestamp("purge_after", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("project_app_project_app_uq").on(t.projectId, t.appId),
    index("project_app_project_status_idx").on(t.projectId, t.status),
  ],
);

/** Tasks app: one row per task, numbered per project. */
export const task = pgTable(
  "task",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    /** backlog | todo | in_progress | done | canceled */
    status: text("status").notNull().default("todo"),
    /** none | low | medium | high | urgent */
    priority: text("priority").notNull().default("none"),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    reporterId: text("reporter_id").references(() => user.id, {
      onDelete: "set null",
    }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    labels: text("labels").array().notNull().default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("task_project_number_uq").on(t.projectId, t.number),
    index("task_project_status_idx").on(t.projectId, t.status),
    index("task_assignee_idx").on(t.assigneeId),
  ],
);

export const taskComment = pgTable(
  "task_comment",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => user.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("task_comment_task_idx").on(t.taskId, t.createdAt)],
);
