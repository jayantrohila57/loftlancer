import {
  activeSupportFaqArticleWhere,
  activeSupportTicketMessageWhere,
  activeSupportTicketWhere,
  db,
  softDeleteSet,
} from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import {
  platformSupportManager,
  supportFaqArticle,
  supportTicket,
  supportTicketMessage,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@loftlancer/db/schema/support";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { notify } from "@loftlancer/notifications";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { protectedProcedure, publicProcedure, router } from "../index";
import { auditSupportSuccess } from "../support/audit";
import { userHasSupportManagerAccess } from "../support/manager";
import {
  assertUserStatusTransition,
  canAddInternalNote,
  canAssignTicket,
  canChangeTicketPriority,
  canChangeTicketStatus,
  canCreateTicket,
  canManageFaq,
  canReadTicket,
  canReplyToTicket,
  canSoftDeleteTicket,
  canViewInternalMessages,
  type SupportAccessContext,
} from "../support/permissions";

const paginationInput = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0),
});

const ticketCategorySchema = z.enum(TICKET_CATEGORIES);
const ticketPrioritySchema = z.enum(TICKET_PRIORITIES);
const ticketStatusSchema = z.enum(TICKET_STATUSES);

async function loadAccess(
  userId: string,
  user?: { role?: string | null } | null,
): Promise<SupportAccessContext> {
  return {
    userId,
    isSupportManager: await userHasSupportManagerAccess(userId, user),
  };
}

async function getTicketById(ticketId: string) {
  const [row] = await db
    .select()
    .from(supportTicket)
    .where(activeSupportTicketWhere(eq(supportTicket.id, ticketId)))
    .limit(1);
  return row ?? null;
}

function mapTicket(row: typeof supportTicket.$inferSelect) {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    requesterUserId: row.requesterUserId,
    assigneeUserId: row.assigneeUserId,
    organizationId: row.organizationId,
    projectId: row.projectId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const supportRouter = router({
  accessStatus: protectedProcedure.query(async ({ ctx }) => {
    const access = await loadAccess(
      ctx.session.user.id,
      ctx.session.user as { role?: string | null },
    );
    return {
      isSupportManager: access.isSupportManager,
      userId: ctx.session.user.id,
    };
  }),

  listFaqPublic: publicProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          category: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const search = input?.search?.trim();
      const category = input?.category?.trim();
      const filters: (SQL | undefined)[] = [
        eq(supportFaqArticle.published, true),
      ];
      if (category) {
        filters.push(eq(supportFaqArticle.category, category));
      }
      if (search) {
        filters.push(
          or(
            ilike(supportFaqArticle.title, `%${search}%`),
            ilike(supportFaqArticle.body, `%${search}%`),
          ),
        );
      }
      const rows = await db
        .select({
          id: supportFaqArticle.id,
          slug: supportFaqArticle.slug,
          title: supportFaqArticle.title,
          category: supportFaqArticle.category,
          sortOrder: supportFaqArticle.sortOrder,
        })
        .from(supportFaqArticle)
        .where(activeSupportFaqArticleWhere(and(...filters)))
        .orderBy(
          asc(supportFaqArticle.category),
          asc(supportFaqArticle.sortOrder),
          asc(supportFaqArticle.title),
        );
      return { items: rows };
    }),

  getFaqBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select()
        .from(supportFaqArticle)
        .where(
          activeSupportFaqArticleWhere(
            and(
              eq(supportFaqArticle.slug, input.slug),
              eq(supportFaqArticle.published, true),
            ),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        body: row.body,
        updatedAt: row.updatedAt.toISOString(),
      };
    }),

  listTickets: protectedProcedure
    .input(
      paginationInput
        .extend({
          search: z.string().optional(),
          status: ticketStatusSchema.optional(),
          category: ticketCategorySchema.optional(),
          priority: ticketPrioritySchema.optional(),
          sortBy: z
            .enum(["createdAt", "updatedAt", "ticketNumber", "priority"])
            .default("updatedAt"),
          sortDir: z.enum(["asc", "desc"]).default("desc"),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      const limit = input?.limit ?? 25;
      const offset = input?.offset ?? 0;
      const conditions: (SQL | undefined)[] = [activeSupportTicketWhere()];

      if (!access.isSupportManager) {
        conditions.push(eq(supportTicket.requesterUserId, ctx.session.user.id));
      }

      if (input?.status) {
        conditions.push(eq(supportTicket.status, input.status));
      }
      if (input?.category) {
        conditions.push(eq(supportTicket.category, input.category));
      }
      if (input?.priority) {
        conditions.push(eq(supportTicket.priority, input.priority));
      }
      const search = input?.search?.trim();
      if (search) {
        const q = or(
          ilike(supportTicket.subject, `%${search}%`),
          sql`cast(${supportTicket.ticketNumber} as text) ilike ${`%${search}%`}`,
        );
        if (q) conditions.push(q);
      }

      const where = and(...conditions);
      const sortCol =
        input?.sortBy === "ticketNumber"
          ? supportTicket.ticketNumber
          : input?.sortBy === "priority"
            ? sql<number>`case ${supportTicket.priority}
                when 'urgent' then 4
                when 'high' then 3
                when 'normal' then 2
                else 1
              end`
            : input?.sortBy === "createdAt"
              ? supportTicket.createdAt
              : supportTicket.updatedAt;
      const order = input?.sortDir === "asc" ? asc(sortCol) : desc(sortCol);

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(supportTicket)
          .where(where),
        db
          .select()
          .from(supportTicket)
          .where(where)
          .orderBy(order)
          .limit(limit)
          .offset(offset),
      ]);

      await auditSupportSuccess("support.ticket.list", ctx.session.user.id);

      return {
        items: rows.map(mapTicket),
        total: countRow?.count ?? 0,
        limit,
        offset,
      };
    }),

  getTicket: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      const ticket = await getTicketById(input.ticketId);
      if (!ticket || !canReadTicket(access, ticket)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      const messageConditions = [
        eq(supportTicketMessage.ticketId, ticket.id),
        activeSupportTicketMessageWhere(),
      ];
      if (!canViewInternalMessages(access)) {
        messageConditions.push(eq(supportTicketMessage.isInternal, false));
      }

      const messages = await db
        .select({
          id: supportTicketMessage.id,
          body: supportTicketMessage.body,
          isInternal: supportTicketMessage.isInternal,
          authorUserId: supportTicketMessage.authorUserId,
          createdAt: supportTicketMessage.createdAt,
          authorName: user.name,
          authorEmail: user.email,
        })
        .from(supportTicketMessage)
        .innerJoin(user, eq(supportTicketMessage.authorUserId, user.id))
        .where(and(...messageConditions))
        .orderBy(asc(supportTicketMessage.createdAt));

      await auditSupportSuccess("support.ticket.read", ctx.session.user.id, {
        entityId: ticket.id,
      });

      return {
        ticket: mapTicket(ticket),
        messages: messages.map((m) => ({
          id: m.id,
          body: m.body,
          isInternal: m.isInternal,
          authorUserId: m.authorUserId,
          authorName: m.authorName,
          authorEmail: m.authorEmail,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    }),

  createTicket: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1).max(200),
        description: z.string().min(1).max(10_000),
        category: ticketCategorySchema,
        priority: ticketPrioritySchema.default("normal"),
        organizationId: z.string().optional(),
        projectId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      if (!canCreateTicket(access)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }

      const id = crypto.randomUUID();
      const [row] = await db
        .insert(supportTicket)
        .values({
          id,
          subject: input.subject.trim(),
          description: input.description.trim(),
          category: input.category,
          priority: input.priority,
          status: "open",
          requesterUserId: ctx.session.user.id,
          organizationId: input.organizationId ?? null,
          projectId: input.projectId ?? null,
        })
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create ticket",
        });
      }

      await auditSupportSuccess("support.ticket.create", ctx.session.user.id, {
        entityId: row.id,
        organizationId: input.organizationId,
        projectId: input.projectId,
        payload: {
          ticketNumber: row.ticketNumber,
          category: row.category,
        },
      });

      return mapTicket(row);
    }),

  replyToTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        body: z.string().min(1).max(10_000),
        isInternal: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      const ticket = await getTicketById(input.ticketId);
      if (!ticket || !canReplyToTicket(access, ticket)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
      const internal = input.isInternal === true;
      if (internal && !canAddInternalNote(access)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }

      const messageId = crypto.randomUUID();
      await db.insert(supportTicketMessage).values({
        id: messageId,
        ticketId: ticket.id,
        authorUserId: ctx.session.user.id,
        body: input.body.trim(),
        isInternal: internal,
      });

      await db
        .update(supportTicket)
        .set({ updatedAt: new Date() })
        .where(eq(supportTicket.id, ticket.id));

      await auditSupportSuccess("support.ticket.reply", ctx.session.user.id, {
        entityId: ticket.id,
        payload: { messageId, isInternal: internal },
      });

      const notifyUserId =
        ctx.session.user.id === ticket.requesterUserId
          ? ticket.assigneeUserId
          : ticket.requesterUserId;

      if (notifyUserId && !internal) {
        await notify({
          type: "support.ticket.reply",
          recipients: [{ userId: notifyUserId }],
          actorUserId: ctx.session.user.id,
          entity: { type: "support_ticket", id: ticket.id },
          data: {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
          },
          idempotencyKey: `support-reply:${messageId}`,
        });
      }

      return { ok: true as const, messageId };
    }),

  updateTicketStatus: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: ticketStatusSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      const ticket = await getTicketById(input.ticketId);
      if (!ticket || !canChangeTicketStatus(access, ticket)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
      if (
        !access.isSupportManager &&
        !assertUserStatusTransition(false, ticket.status, input.status)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only reopen closed tickets",
        });
      }

      await db
        .update(supportTicket)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(supportTicket.id, ticket.id));

      const action =
        input.status === "open" &&
        (ticket.status === "closed" || ticket.status === "resolved")
          ? "support.ticket.reopen"
          : "support.ticket.status.change";

      await auditSupportSuccess(action, ctx.session.user.id, {
        entityId: ticket.id,
        payload: { from: ticket.status, to: input.status },
      });

      return { ok: true as const };
    }),

  assignTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        assigneeUserId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      if (!canAssignTicket(access)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
      const ticket = await getTicketById(input.ticketId);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      await db
        .update(supportTicket)
        .set({
          assigneeUserId: input.assigneeUserId,
          updatedAt: new Date(),
        })
        .where(eq(supportTicket.id, ticket.id));

      await auditSupportSuccess("support.ticket.assign", ctx.session.user.id, {
        entityId: ticket.id,
        targetUserId: input.assigneeUserId,
      });

      return { ok: true as const };
    }),

  updateTicketPriority: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        priority: ticketPrioritySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      if (!canChangeTicketPriority(access)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
      const ticket = await getTicketById(input.ticketId);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      await db
        .update(supportTicket)
        .set({ priority: input.priority, updatedAt: new Date() })
        .where(eq(supportTicket.id, ticket.id));

      await auditSupportSuccess(
        "support.ticket.priority.change",
        ctx.session.user.id,
        {
          entityId: ticket.id,
          payload: { from: ticket.priority, to: input.priority },
        },
      );

      return { ok: true as const };
    }),

  deleteTicket: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      if (!canSoftDeleteTicket(access)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }
      const ticket = await getTicketById(input.ticketId);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      if (isSoftDeletesEnabled()) {
        await db
          .update(supportTicket)
          .set(softDeleteSet(ctx.session.user.id))
          .where(eq(supportTicket.id, ticket.id));
      } else {
        await db
          .delete(supportTicketMessage)
          .where(eq(supportTicketMessage.ticketId, ticket.id));
        await db.delete(supportTicket).where(eq(supportTicket.id, ticket.id));
      }

      await auditSupportSuccess("support.ticket.delete", ctx.session.user.id, {
        entityId: ticket.id,
      });

      return { ok: true as const };
    }),

  listFaqManager: protectedProcedure.query(async ({ ctx }) => {
    const access = await loadAccess(
      ctx.session.user.id,
      ctx.session.user as { role?: string | null },
    );
    if (!canManageFaq(access)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
    }
    const rows = await db
      .select()
      .from(supportFaqArticle)
      .where(activeSupportFaqArticleWhere())
      .orderBy(
        asc(supportFaqArticle.category),
        asc(supportFaqArticle.sortOrder),
      );
    return {
      items: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        body: row.body,
        published: row.published,
        sortOrder: row.sortOrder,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }),

  upsertFaqArticle: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        slug: z.string().min(1).max(120),
        title: z.string().min(1).max(200),
        category: z.string().min(1).max(80),
        body: z.string().min(1).max(50_000),
        published: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      if (!canManageFaq(access)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }

      if (input.id) {
        await db
          .update(supportFaqArticle)
          .set({
            slug: input.slug.trim(),
            title: input.title.trim(),
            category: input.category.trim(),
            body: input.body,
            published: input.published,
            sortOrder: input.sortOrder,
            updatedBy: ctx.session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(supportFaqArticle.id, input.id));

        await auditSupportSuccess("support.faq.update", ctx.session.user.id, {
          entityId: input.id,
        });
        return { id: input.id };
      }

      const id = crypto.randomUUID();
      await db.insert(supportFaqArticle).values({
        id,
        slug: input.slug.trim(),
        title: input.title.trim(),
        category: input.category.trim(),
        body: input.body,
        published: input.published,
        sortOrder: input.sortOrder,
        createdBy: ctx.session.user.id,
        updatedBy: ctx.session.user.id,
      });

      await auditSupportSuccess("support.faq.create", ctx.session.user.id, {
        entityId: id,
      });
      return { id };
    }),

  deleteFaqArticle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const access = await loadAccess(
        ctx.session.user.id,
        ctx.session.user as { role?: string | null },
      );
      if (!canManageFaq(access)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }

      if (isSoftDeletesEnabled()) {
        await db
          .update(supportFaqArticle)
          .set(softDeleteSet(ctx.session.user.id))
          .where(eq(supportFaqArticle.id, input.id));
      } else {
        await db
          .delete(supportFaqArticle)
          .where(eq(supportFaqArticle.id, input.id));
      }

      await auditSupportSuccess("support.faq.delete", ctx.session.user.id, {
        entityId: input.id,
      });
      return { ok: true as const };
    }),

  listSupportManagers: protectedProcedure.query(async ({ ctx }) => {
    const access = await loadAccess(
      ctx.session.user.id,
      ctx.session.user as { role?: string | null },
    );
    if (!access.isSupportManager) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
    }
    const rows = await db
      .select({
        userId: platformSupportManager.userId,
        email: user.email,
        name: user.name,
      })
      .from(platformSupportManager)
      .innerJoin(user, eq(platformSupportManager.userId, user.id));
    return { items: rows };
  }),
});
