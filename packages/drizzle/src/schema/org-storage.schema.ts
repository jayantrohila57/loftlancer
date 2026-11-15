import { relations } from "drizzle-orm"
import {
  bigint,
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { user } from "./auth.schema"
import { organization } from "./organization.schema"

export const orgStorageFolder = pgTable(
  "org_storage_folder",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    parentFolderId: text("parent_folder_id"),
    displayName: text("display_name").notNull(),
    isRoot: boolean("is_root").notNull().default(false),
    depth: integer("depth").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    trashedAt: timestamp("trashed_at"),
  },
  (table) => [
    index("org_storage_folder_org_id_idx").on(table.organizationId),
    index("org_storage_folder_parent_id_idx").on(table.parentFolderId),
    uniqueIndex("org_storage_folder_org_parent_name_uidx").on(
      table.organizationId,
      table.parentFolderId,
      table.displayName
    ),
    foreignKey({
      columns: [table.parentFolderId],
      foreignColumns: [table.id],
      name: "org_storage_folder_parent_folder_id_fk",
    }).onDelete("cascade"),
  ]
)

export const orgStorageItem = pgTable(
  "org_storage_item",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    folderId: text("folder_id").references(() => orgStorageFolder.id, {
      onDelete: "set null",
    }),
    uploadedByUserId: text("uploaded_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    displayName: text("display_name").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: bigint("byte_size", { mode: "number" }).notNull(),
    storageProvider: text("storage_provider", { enum: ["vercel_blob"] })
      .notNull()
      .default("vercel_blob"),
    blobPathname: text("blob_pathname").notNull(),
    accessMode: text("access_mode", { enum: ["org_private"] })
      .notNull()
      .default("org_private"),
    purpose: text("purpose", { enum: ["org_upload", "org_avatar"] })
      .notNull()
      .default("org_upload"),
    status: text("status", {
      enum: ["active", "trash", "pending_upload"],
    })
      .notNull()
      .default("pending_upload"),
    checksum: text("checksum"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    trashedAt: timestamp("trashed_at"),
    purgedAt: timestamp("purged_at"),
  },
  (table) => [
    index("org_storage_item_org_id_idx").on(table.organizationId),
    index("org_storage_item_folder_id_idx").on(table.folderId),
    index("org_storage_item_status_idx").on(table.status),
    uniqueIndex("org_storage_item_org_folder_name_uidx").on(
      table.organizationId,
      table.folderId,
      table.displayName
    ),
  ]
)

export const orgStorageGrant = pgTable(
  "org_storage_grant",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    folderId: text("folder_id").references(() => orgStorageFolder.id, {
      onDelete: "cascade",
    }),
    itemId: text("item_id").references(() => orgStorageItem.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessLevel: text("access_level", { enum: ["view_edit"] })
      .notNull()
      .default("view_edit"),
    includesDescendants: boolean("includes_descendants")
      .notNull()
      .default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("org_storage_grant_org_id_idx").on(table.organizationId),
    index("org_storage_grant_user_id_idx").on(table.userId),
    index("org_storage_grant_folder_id_idx").on(table.folderId),
    index("org_storage_grant_item_id_idx").on(table.itemId),
  ]
)

export const orgStorageFolderRelations = relations(
  orgStorageFolder,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [orgStorageFolder.organizationId],
      references: [organization.id],
    }),
    parentFolder: one(orgStorageFolder, {
      fields: [orgStorageFolder.parentFolderId],
      references: [orgStorageFolder.id],
      relationName: "folder_tree",
    }),
    items: many(orgStorageItem),
    grants: many(orgStorageGrant),
  })
)

export const orgStorageItemRelations = relations(orgStorageItem, ({ one }) => ({
  organization: one(organization, {
    fields: [orgStorageItem.organizationId],
    references: [organization.id],
  }),
  folder: one(orgStorageFolder, {
    fields: [orgStorageItem.folderId],
    references: [orgStorageFolder.id],
  }),
  uploadedBy: one(user, {
    fields: [orgStorageItem.uploadedByUserId],
    references: [user.id],
  }),
}))

export const orgStorageGrantRelations = relations(
  orgStorageGrant,
  ({ one }) => ({
    organization: one(organization, {
      fields: [orgStorageGrant.organizationId],
      references: [organization.id],
    }),
    folder: one(orgStorageFolder, {
      fields: [orgStorageGrant.folderId],
      references: [orgStorageFolder.id],
    }),
    item: one(orgStorageItem, {
      fields: [orgStorageGrant.itemId],
      references: [orgStorageItem.id],
    }),
    grantee: one(user, {
      fields: [orgStorageGrant.userId],
      references: [user.id],
    }),
  })
)
