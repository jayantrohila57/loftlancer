import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { organization } from "./organization";
import { project } from "./projects";
import { team } from "./team";

/** A message sent through the shared email sender (#344). */
export const mailMessage = pgTable(
  "mail_message",
  {
    id: text("id").primaryKey(),
    providerMessageId: text("provider_message_id"),
    threadId: text("thread_id"),
    fromEmail: text("from_email").notNull(),
    replyTo: text("reply_to"),
    subject: text("subject").notNull(),
    html: text("html").notNull(),
    text: text("text").notNull(),
    templateKey: text("template_key"),
    templateProps: jsonb("template_props"),
    tags: jsonb("tags").notNull().default(sql`'[]'::jsonb`),
    /** system | work | personal */
    category: text("category").notNull().default("system"),
    /** queued | sent | delivered | bounced | failed | skipped */
    deliveryStatus: text("delivery_status").notNull(),
    deliveryError: text("delivery_error"),
    idempotencyKey: text("idempotency_key"),
    senderUserId: text("sender_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    teamId: text("team_id").references(() => team.id, {
      onDelete: "set null",
    }),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "mail_message_category_check",
      sql`${table.category} in ('system', 'work', 'personal')`,
    ),
    check(
      "mail_message_delivery_status_check",
      sql`${table.deliveryStatus} in ('queued', 'sent', 'delivered', 'bounced', 'failed', 'skipped')`,
    ),
    uniqueIndex("mail_message_idempotency_uidx")
      .on(table.idempotencyKey)
      .where(sql`${table.idempotencyKey} IS NOT NULL`),
    uniqueIndex("mail_message_provider_message_uidx")
      .on(table.providerMessageId)
      .where(sql`${table.providerMessageId} IS NOT NULL`),
    index("mail_message_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("mail_message_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
    index("mail_message_sender_created_idx").on(
      table.senderUserId,
      table.createdAt,
    ),
  ],
);

/** Per-recipient mailbox state for an email message. */
export const mailRecipient = pgTable(
  "mail_recipient",
  {
    id: text("id").primaryKey(),
    messageId: text("message_id")
      .notNull()
      .references(() => mailMessage.id, { onDelete: "cascade" }),
    recipientUserId: text("recipient_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    /** inbox | sent */
    folder: text("folder").notNull().default("inbox"),
    readAt: timestamp("read_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    starredAt: timestamp("starred_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "mail_recipient_folder_check",
      sql`${table.folder} in ('inbox', 'sent')`,
    ),
    uniqueIndex("mail_recipient_message_email_folder_uidx").on(
      table.messageId,
      table.email,
      table.folder,
    ),
    index("mail_recipient_user_folder_created_idx").on(
      table.recipientUserId,
      table.folder,
      table.createdAt,
    ),
    index("mail_recipient_email_created_idx").on(table.email, table.createdAt),
  ],
);

export const mailMessageRelations = relations(mailMessage, ({ many, one }) => ({
  sender: one(user, {
    fields: [mailMessage.senderUserId],
    references: [user.id],
    relationName: "mailSender",
  }),
  organization: one(organization, {
    fields: [mailMessage.organizationId],
    references: [organization.id],
  }),
  team: one(team, {
    fields: [mailMessage.teamId],
    references: [team.id],
  }),
  project: one(project, {
    fields: [mailMessage.projectId],
    references: [project.id],
  }),
  recipients: many(mailRecipient),
}));

export const mailRecipientRelations = relations(mailRecipient, ({ one }) => ({
  message: one(mailMessage, {
    fields: [mailRecipient.messageId],
    references: [mailMessage.id],
  }),
  recipient: one(user, {
    fields: [mailRecipient.recipientUserId],
    references: [user.id],
    relationName: "mailRecipient",
  }),
}));
