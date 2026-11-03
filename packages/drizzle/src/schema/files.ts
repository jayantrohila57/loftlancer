import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { organization } from "./organization";
import { project } from "./projects";

/** Per-organization storage cap and reserved bytes for in-flight direct uploads. */
export const organizationStoragePolicy = pgTable(
  "organization_storage_policy",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    storageLimitBytes: integer("storage_limit_bytes")
      .notNull()
      .default(1_073_741_824),
    storageUsedBytes: integer("storage_used_bytes").notNull().default(0),
    storageReservedBytes: integer("storage_reserved_bytes")
      .notNull()
      .default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check(
      "organization_storage_policy_limit_check",
      sql`${table.storageLimitBytes} >= 0`,
    ),
    check(
      "organization_storage_policy_used_check",
      sql`${table.storageUsedBytes} >= 0`,
    ),
    check(
      "organization_storage_policy_reserved_check",
      sql`${table.storageReservedBytes} >= 0`,
    ),
  ],
);

/** Metadata only. Objects remain private in Blob and are served through an authorized route. */
export const storedFile = pgTable(
  "stored_file",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "cascade",
    }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    pathname: text("pathname").notNull().unique(),
    blobUrl: text("blob_url").unique(),
    originalName: text("original_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    status: text("status").notNull().default("pending"),
    uploadExpiresAt: timestamp("upload_expires_at", {
      withTimezone: true,
    }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("stored_file_size_check", sql`${table.sizeBytes} > 0`),
    check(
      "stored_file_status_check",
      sql`${table.status} in ('pending', 'complete', 'failed', 'deleted')`,
    ),
    index("stored_file_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("stored_file_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
    index("stored_file_pending_expiry_idx").on(
      table.status,
      table.uploadExpiresAt,
    ),
  ],
);

export const organizationStoragePolicyRelations = relations(
  organizationStoragePolicy,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationStoragePolicy.organizationId],
      references: [organization.id],
    }),
  }),
);
