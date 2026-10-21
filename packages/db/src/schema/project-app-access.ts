import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organization";
import { projectApp } from "./project-app";
import { project } from "./projects";
import { team } from "./team";

/** Direct user and linked-team access to one installed project app. */
export const projectAppAccess = pgTable(
  "project_app_access",
  {
    id: text("id").primaryKey(),
    projectAppId: text("project_app_id")
      .notNull()
      .references(() => projectApp.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    teamId: text("team_id").references(() => team.id, { onDelete: "cascade" }),
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
  (t) => [
    check(
      "project_app_access_subject_check",
      sql`(${t.userId} is not null and ${t.teamId} is null) or (${t.userId} is null and ${t.teamId} is not null)`,
    ),
    index("project_app_access_project_idx").on(t.projectId, t.projectAppId),
    uniqueIndex("project_app_access_user_uq")
      .on(t.projectAppId, t.userId)
      .where(sql`${t.userId} is not null and ${t.deletedAt} is null`),
    uniqueIndex("project_app_access_team_uq")
      .on(t.projectAppId, t.teamId)
      .where(sql`${t.teamId} is not null and ${t.deletedAt} is null`),
  ],
);
