import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organization";
import { project } from "./projects";
import { team } from "./team";

export const projectManager = pgTable(
  "project_manager",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("project_manager_user_idx").on(table.userId),
    index("project_manager_project_idx").on(table.projectId),
    index("project_manager_org_project_user_idx").on(
      table.organizationId,
      table.projectId,
      table.userId,
    ),
    foreignKey({
      name: "project_manager_project_org_fk",
      columns: [table.projectId, table.organizationId],
      foreignColumns: [project.id, project.organizationId],
    }).onDelete("cascade"),
  ],
);

export const projectTeam = pgTable(
  "project_team",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("project_team_project_idx").on(table.projectId),
    index("project_team_org_project_team_idx").on(
      table.organizationId,
      table.projectId,
      table.teamId,
    ),
    foreignKey({
      name: "project_team_project_org_fk",
      columns: [table.projectId, table.organizationId],
      foreignColumns: [project.id, project.organizationId],
    }).onDelete("cascade"),
    foreignKey({
      name: "project_team_team_org_fk",
      columns: [table.teamId, table.organizationId],
      foreignColumns: [team.id, team.organizationId],
    }).onDelete("cascade"),
  ],
);

export const projectMemberGrant = pgTable(
  "project_member_grant",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    grants: text("grants").array().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
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
    index("project_member_grant_user_idx").on(table.userId),
    index("project_member_grant_project_idx").on(table.projectId),
    index("project_member_grant_org_project_user_idx").on(
      table.organizationId,
      table.projectId,
      table.userId,
    ),
    foreignKey({
      name: "project_member_grant_project_org_fk",
      columns: [table.projectId, table.organizationId],
      foreignColumns: [project.id, project.organizationId],
    }).onDelete("cascade"),
  ],
);

export const projectManagerRelations = relations(projectManager, ({ one }) => ({
  project: one(project, {
    fields: [projectManager.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectManager.userId],
    references: [user.id],
  }),
}));
