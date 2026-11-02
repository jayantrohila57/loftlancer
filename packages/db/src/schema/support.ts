import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organization } from "./organization";
import { project } from "./projects";

export const supportTicketNumberSequence = pgSequence(
  "support_ticket_number_seq",
  { startWith: 1001 },
);

export const platformSupportManager = pgTable("platform_support_manager", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  grantedBy: text("granted_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const supportTicket = pgTable(
  "support_ticket",
  {
    id: text("id").primaryKey(),
    ticketNumber: integer("ticket_number")
      .notNull()
      .default(sql`nextval('support_ticket_number_seq')`),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    priority: text("priority").default("normal").notNull(),
    status: text("status").default("open").notNull(),
    requesterUserId: text("requester_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assigneeUserId: text("assignee_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("support_ticket_ticket_number_unique").on(table.ticketNumber),
    index("support_ticket_requester_status_idx").on(
      table.requesterUserId,
      table.status,
    ),
    index("support_ticket_status_created_idx").on(
      table.status,
      table.createdAt,
    ),
    index("support_ticket_assignee_idx").on(table.assigneeUserId),
  ],
);

export const supportTicketMessage = pgTable(
  "support_ticket_message",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => supportTicket.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    isInternal: boolean("is_internal").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("support_ticket_message_ticket_created_idx").on(
      table.ticketId,
      table.createdAt,
    ),
  ],
);

export const supportFaqArticle = pgTable(
  "support_faq_article",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    body: text("body").notNull(),
    published: boolean("published").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("support_faq_article_slug_active_uidx")
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    index("support_faq_article_category_sort_idx").on(
      table.category,
      table.sortOrder,
    ),
  ],
);

export const supportTicketRelations = relations(
  supportTicket,
  ({ one, many }) => ({
    requester: one(user, {
      fields: [supportTicket.requesterUserId],
      references: [user.id],
      relationName: "ticketRequester",
    }),
    assignee: one(user, {
      fields: [supportTicket.assigneeUserId],
      references: [user.id],
      relationName: "ticketAssignee",
    }),
    organization: one(organization, {
      fields: [supportTicket.organizationId],
      references: [organization.id],
    }),
    project: one(project, {
      fields: [supportTicket.projectId],
      references: [project.id],
    }),
    messages: many(supportTicketMessage),
  }),
);

export const supportTicketMessageRelations = relations(
  supportTicketMessage,
  ({ one }) => ({
    ticket: one(supportTicket, {
      fields: [supportTicketMessage.ticketId],
      references: [supportTicket.id],
    }),
    author: one(user, {
      fields: [supportTicketMessage.authorUserId],
      references: [user.id],
    }),
  }),
);

export const TICKET_CATEGORIES = [
  "bug",
  "billing",
  "account",
  "feature_request",
  "other",
] as const;

export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const TICKET_STATUSES = [
  "open",
  "pending",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
