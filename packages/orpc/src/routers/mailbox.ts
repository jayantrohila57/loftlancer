import { db } from "@loftlancer/drizzle";
import { mailMessage, mailRecipient } from "@loftlancer/drizzle/schema/resend";
import {
  makeResponseSchema,
  respond,
} from "@modules/projects/utils/validation/utils.project-environment.validation";
import { and, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { protectedProcedure, router } from "../index";

const mailboxFolder = z.enum(["all", "inbox", "sent", "archived"]);
const mailboxCategory = z.enum(["system", "work", "personal"]);
const cursorSchema = z.object({
  createdAt: z.coerce.date(),
  id: z.string(),
});

const mailboxItemOutput = z.object({
  id: z.string(),
  messageId: z.string(),
  folder: z.enum(["inbox", "sent"]),
  email: z.string(),
  subject: z.string(),
  text: z.string(),
  category: mailboxCategory,
  deliveryStatus: z.string(),
  organizationId: z.string().nullable(),
  teamId: z.string().nullable(),
  projectId: z.string().nullable(),
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  readAt: z.date().nullable(),
  archivedAt: z.date().nullable(),
  starredAt: z.date().nullable(),
  createdAt: z.date(),
});

function ownedMailboxWhere(
  userId: string,
  input: {
    folder?: z.infer<typeof mailboxFolder>;
    unreadOnly?: boolean;
    category?: z.infer<typeof mailboxCategory>;
    cursor?: z.infer<typeof cursorSchema>;
  },
) {
  const conditions = [eq(mailRecipient.recipientUserId, userId)];
  if (input.folder === "archived")
    conditions.push(sql`${mailRecipient.archivedAt} IS NOT NULL`);
  else if (input.folder) {
    conditions.push(eq(mailRecipient.folder, input.folder));
    conditions.push(isNull(mailRecipient.archivedAt));
  } else {
    conditions.push(isNull(mailRecipient.archivedAt));
  }
  if (input.unreadOnly) conditions.push(isNull(mailRecipient.readAt));
  if (input.category) conditions.push(eq(mailMessage.category, input.category));
  if (input.cursor) {
    const cursorCondition = or(
      lt(mailMessage.createdAt, input.cursor.createdAt),
      and(
        eq(mailMessage.createdAt, input.cursor.createdAt),
        lt(mailRecipient.id, input.cursor.id),
      ),
    );
    if (cursorCondition) conditions.push(cursorCondition);
  }
  return and(...conditions);
}

export const mailboxRouter = router({
  unreadCount: protectedProcedure
    .output(makeResponseSchema(z.number()))
    .query(async ({ ctx }) => {
      const [row] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(mailRecipient)
        .where(
          and(
            eq(mailRecipient.recipientUserId, ctx.session.user.id),
            eq(mailRecipient.folder, "inbox"),
            isNull(mailRecipient.readAt),
            isNull(mailRecipient.archivedAt),
          ),
        );
      return respond({ message: "Unread mail fetched", data: row?.total ?? 0 });
    }),

  list: protectedProcedure
    .input(
      z.object({
        folder: mailboxFolder.optional().default("all"),
        unreadOnly: z.boolean().optional(),
        category: mailboxCategory.optional(),
        cursor: cursorSchema.optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .output(
      makeResponseSchema(
        z.object({
          items: z.array(mailboxItemOutput),
          nextCursor: cursorSchema.nullable(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select({
          id: mailRecipient.id,
          messageId: mailMessage.id,
          folder: mailRecipient.folder,
          email: mailRecipient.email,
          subject: mailMessage.subject,
          text: mailMessage.text,
          category: mailMessage.category,
          deliveryStatus: mailMessage.deliveryStatus,
          organizationId: mailMessage.organizationId,
          teamId: mailMessage.teamId,
          projectId: mailMessage.projectId,
          entityType: mailMessage.entityType,
          entityId: mailMessage.entityId,
          readAt: mailRecipient.readAt,
          archivedAt: mailRecipient.archivedAt,
          starredAt: mailRecipient.starredAt,
          createdAt: mailMessage.createdAt,
        })
        .from(mailRecipient)
        .innerJoin(mailMessage, eq(mailRecipient.messageId, mailMessage.id))
        .where(ownedMailboxWhere(ctx.session.user.id, input))
        .orderBy(desc(mailMessage.createdAt), desc(mailRecipient.id))
        .limit(input.limit + 1);
      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, input.limit) : rows;
      const last = items.at(-1);
      return respond({
        message: "Mailbox fetched",
        data: {
          items: items.map((row) => ({
            ...row,
            folder: row.folder === "sent" ? "sent" : "inbox",
            category: mailboxCategory.parse(row.category),
          })),
          nextCursor:
            hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
        },
      });
    }),

  setRead: protectedProcedure
    .input(z.object({ id: z.string(), read: z.boolean() }))
    .output(makeResponseSchema(z.boolean()))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(mailRecipient)
        .set({ readAt: input.read ? new Date() : null })
        .where(
          and(
            eq(mailRecipient.id, input.id),
            eq(mailRecipient.recipientUserId, ctx.session.user.id),
          ),
        )
        .returning({ id: mailRecipient.id });
      return respond({ message: "Mail state saved", data: Boolean(updated) });
    }),

  setArchived: protectedProcedure
    .input(z.object({ id: z.string(), archived: z.boolean() }))
    .output(makeResponseSchema(z.boolean()))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(mailRecipient)
        .set({ archivedAt: input.archived ? new Date() : null })
        .where(
          and(
            eq(mailRecipient.id, input.id),
            eq(mailRecipient.recipientUserId, ctx.session.user.id),
          ),
        )
        .returning({ id: mailRecipient.id });
      return respond({ message: "Mail state saved", data: Boolean(updated) });
    }),

  setStarred: protectedProcedure
    .input(z.object({ id: z.string(), starred: z.boolean() }))
    .output(makeResponseSchema(z.boolean()))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(mailRecipient)
        .set({ starredAt: input.starred ? new Date() : null })
        .where(
          and(
            eq(mailRecipient.id, input.id),
            eq(mailRecipient.recipientUserId, ctx.session.user.id),
          ),
        )
        .returning({ id: mailRecipient.id });
      return respond({ message: "Mail state saved", data: Boolean(updated) });
    }),
});
