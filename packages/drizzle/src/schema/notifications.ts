import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { organization } from "./organization";
export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    recipientUserId: text("recipient_user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    recipientEmail: text("recipient_email"),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    type: text("type").notNull(),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    data: jsonb("data").notNull().default({}),
    title: text("title"),
    body: text("body"),
    readAt: timestamp("read_at"),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("notification_recipient_user_read_created_idx").on(
      table.recipientUserId,
      table.readAt,
      table.createdAt,
    ),
    index("notification_recipient_email_idx").on(table.recipientEmail),
    uniqueIndex("notification_user_idempotency_uidx")
      .on(table.recipientUserId, table.idempotencyKey)
      .where(
        sql`${table.idempotencyKey} IS NOT NULL AND ${table.recipientUserId} IS NOT NULL`,
      ),
    uniqueIndex("notification_email_idempotency_uidx")
      .on(table.recipientEmail, table.idempotencyKey)
      .where(
        sql`${table.idempotencyKey} IS NOT NULL AND ${table.recipientEmail} IS NOT NULL`,
      ),
  ],
);

export const notificationRelations = relations(notification, ({ one }) => ({
  recipientUser: one(user, {
    fields: [notification.recipientUserId],
    references: [user.id],
    relationName: "notificationRecipient",
  }),
  actorUser: one(user, {
    fields: [notification.actorUserId],
    references: [user.id],
    relationName: "notificationActor",
  }),
  organization: one(organization, {
    fields: [notification.organizationId],
    references: [organization.id],
  }),
}));
