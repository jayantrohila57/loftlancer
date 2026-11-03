import {
  activeMemberWhere,
  activeProjectWhere,
  activeUserWhere,
  db,
} from "@loftlancer/drizzle";
import { auditEvent } from "@loftlancer/drizzle/schema/audit-event";
import { session, user } from "@loftlancer/drizzle/schema/auth";
import { member, organization } from "@loftlancer/drizzle/schema/organization";
import { project } from "@loftlancer/drizzle/schema/projects";
import { platformSupportManager } from "@loftlancer/drizzle/schema/support";
import {
  makeResponseSchema,
  respond,
} from "@modules/projects/utils/validation/utils.project-environment.validation";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { z } from "zod/v3";
import {
  evaluateConsoleOperatorAccess,
  logConsoleOperatorAccess,
} from "../console-operator-access";
import { consoleProcedure, publicProcedure, router } from "../index";
import { platformAdminEndpoints } from "./platform-admin";
import {
  assertPlatformOperatorList,
  assertPlatformSetRole,
  assertPlatformSupportManagerChange,
  toIsoString,
} from "./platform-helpers";

const paginationInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

const userRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  banned: z.boolean(),
  createdAt: z.string(),
});

export const platformRouter = router({
  ...platformAdminEndpoints,
  accessStatus: publicProcedure.query(({ ctx }) => {
    const evaluation = evaluateConsoleOperatorAccess(ctx.session);
    if (!evaluation.allowed) {
      logConsoleOperatorAccess(evaluation, { surface: "trpc" });
    }
    return {
      allowed: evaluation.allowed,
      reason: evaluation.reason,
      needsSignIn: evaluation.reason === "unauthenticated",
    };
  }),

  overview: consoleProcedure.query(async ({ ctx }) => {
    await assertPlatformOperatorList(ctx.session.user.id);

    async function safeCount(
      label: string,
      run: () => Promise<number>,
    ): Promise<{ value: number } | { error: string }> {
      try {
        const value = await run();
        return { value };
      } catch {
        return { error: `Failed to load ${label}` };
      }
    }

    const [users, organizations, projects, sessions] = await Promise.all([
      safeCount("users", async () => {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(user)
          .where(activeUserWhere());
        return row?.count ?? 0;
      }),
      safeCount("organizations", async () => {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(organization)
          .where(isNull(organization.deletedAt));
        return row?.count ?? 0;
      }),
      safeCount("projects", async () => {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(project)
          .where(isNull(project.deletedAt));
        return row?.count ?? 0;
      }),
      safeCount("sessions", async () => {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(session);
        return row?.count ?? 0;
      }),
    ]);

    return {
      users,
      organizations,
      projects,
      sessions,
    };
  }),

  listUsers: consoleProcedure
    .input(
      paginationInput
        .extend({
          search: z.string().optional(),
        })
        .optional(),
    )
    .output(
      makeResponseSchema(
        z.object({
          items: z.array(userRowSchema),
          total: z.number().int(),
          limit: z.number().int(),
          offset: z.number().int(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const search = input?.search?.trim();

      const where = activeUserWhere(
        search ? ilike(user.email, `%${search}%`) : undefined,
      );

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(user)
          .where(where),
        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            banned: user.banned,
            createdAt: user.createdAt,
          })
          .from(user)
          .where(where)
          .orderBy(desc(user.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return respond({
        message: "Users fetched",
        data: {
          items: rows.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            banned: row.banned,
            createdAt: toIsoString(row.createdAt),
          })),
          total: countRow?.count ?? 0,
          limit,
          offset,
        },
      });
    }),

  getUser: consoleProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const [row] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .where(activeUserWhere(eq(user.id, input.userId)))
        .limit(1);

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const sessionsForUser = await db
        .select({
          id: session.id,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          impersonatedBy: session.impersonatedBy,
        })
        .from(session)
        .where(eq(session.userId, input.userId))
        .orderBy(desc(session.createdAt))
        .limit(20);

      const [supportRow] = await db
        .select({ userId: platformSupportManager.userId })
        .from(platformSupportManager)
        .where(eq(platformSupportManager.userId, input.userId))
        .limit(1);

      return {
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          banned: row.banned,
          banReason: row.banReason,
          banExpires: row.banExpires ? toIsoString(row.banExpires) : null,
          isSupportManager: Boolean(supportRow),
          createdAt: toIsoString(row.createdAt),
          updatedAt: toIsoString(row.updatedAt),
        },
        sessions: sessionsForUser.map((s) => ({
          id: s.id,
          createdAt: toIsoString(s.createdAt),
          expiresAt: toIsoString(s.expiresAt),
          impersonatedBy: s.impersonatedBy,
        })),
      };
    }),

  setUserRole: consoleProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformSetRole(ctx.session.user.id, input.userId);

      await db
        .update(user)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(user.id, input.userId));

      return { ok: true as const };
    }),

  setSupportManager: consoleProcedure
    .input(
      z.object({
        userId: z.string(),
        granted: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformSupportManagerChange(
        ctx.session.user.id,
        input.userId,
        input.granted,
      );

      if (input.granted) {
        await db
          .insert(platformSupportManager)
          .values({
            userId: input.userId,
            grantedBy: ctx.session.user.id,
          })
          .onConflictDoNothing();
      } else {
        await db
          .delete(platformSupportManager)
          .where(eq(platformSupportManager.userId, input.userId));
      }

      return { ok: true as const };
    }),

  listOrganizations: consoleProcedure
    .input(
      paginationInput
        .extend({
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const search = input?.search?.trim();

      const conditions: SQL[] = [isNull(organization.deletedAt)];
      if (search) {
        const searchCondition = or(
          ilike(organization.name, `%${search}%`),
          ilike(organization.slug, `%${search}%`),
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }
      const where = and(...conditions);

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(organization)
          .where(where),
        db
          .select({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            createdAt: organization.createdAt,
          })
          .from(organization)
          .where(where)
          .orderBy(desc(organization.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return {
        items: rows.map((row) => ({
          ...row,
          createdAt: toIsoString(row.createdAt),
        })),
        total: countRow?.count ?? 0,
        limit,
        offset,
      };
    }),

  getOrganization: consoleProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const [org] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          createdAt: organization.createdAt,
        })
        .from(organization)
        .where(
          and(
            eq(organization.id, input.organizationId),
            isNull(organization.deletedAt),
          ),
        )
        .limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const [members, projects, auditItems] = await Promise.all([
        db
          .select({
            id: member.id,
            userId: member.userId,
            role: member.role,
            email: user.email,
            name: user.name,
            createdAt: member.createdAt,
          })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .where(
            activeMemberWhere(eq(member.organizationId, input.organizationId)),
          )
          .orderBy(desc(member.createdAt)),
        db
          .select({
            id: project.id,
            name: project.name,
            slug: project.slug,
            status: project.status,
            createdAt: project.createdAt,
          })
          .from(project)
          .where(
            activeProjectWhere(
              eq(project.organizationId, input.organizationId),
            ),
          )
          .orderBy(desc(project.createdAt)),
        db
          .select({
            id: auditEvent.id,
            action: auditEvent.action,
            result: auditEvent.result,
            source: auditEvent.source,
            createdAt: auditEvent.createdAt,
          })
          .from(auditEvent)
          .where(eq(auditEvent.organizationId, input.organizationId))
          .orderBy(desc(auditEvent.createdAt))
          .limit(50),
      ]);

      return {
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          createdAt: toIsoString(org.createdAt),
        },
        members: members.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          email: m.email,
          name: m.name,
          createdAt: toIsoString(m.createdAt),
        })),
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          status: p.status,
          createdAt: toIsoString(p.createdAt),
        })),
        audit: auditItems.map((e) => ({
          id: e.id,
          action: e.action,
          result: e.result,
          source: e.source,
          createdAt: toIsoString(e.createdAt),
        })),
      };
    }),

  listSessions: consoleProcedure
    .input(
      paginationInput
        .extend({
          search: z.string().optional(),
          userId: z.string().optional(),
          impersonatedOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const search = input?.search?.trim();

      const conditions: SQL[] = [];
      if (input?.userId) {
        conditions.push(eq(session.userId, input.userId));
      }
      if (input?.impersonatedOnly) {
        conditions.push(isNotNull(session.impersonatedBy));
      }
      if (search) {
        conditions.push(ilike(user.email, `%${search}%`));
      }

      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(session)
          .innerJoin(user, eq(session.userId, user.id))
          .where(where),
        db
          .select({
            id: session.id,
            userId: session.userId,
            userEmail: user.email,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            impersonatedBy: session.impersonatedBy,
          })
          .from(session)
          .innerJoin(user, eq(session.userId, user.id))
          .where(where)
          .orderBy(desc(session.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return {
        items: rows.map((row) => ({
          id: row.id,
          userId: row.userId,
          userEmail: row.userEmail,
          impersonatedBy: row.impersonatedBy,
          createdAt: toIsoString(row.createdAt),
          expiresAt: toIsoString(row.expiresAt),
        })),
        total: countRow?.count ?? 0,
        limit,
        offset,
      };
    }),

  revokeSession: consoleProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const deleted = await db
        .delete(session)
        .where(eq(session.id, input.sessionId))
        .returning({ id: session.id });

      if (deleted.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return { ok: true as const };
    }),

  listAuditEvents: consoleProcedure
    .input(
      paginationInput
        .extend({
          actorUserId: z.string().optional(),
          organizationId: z.string().optional(),
          action: z.string().optional(),
          source: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const conditions: SQL[] = [];
      if (input?.actorUserId) {
        conditions.push(eq(auditEvent.actorUserId, input.actorUserId));
      }
      if (input?.organizationId) {
        conditions.push(eq(auditEvent.organizationId, input.organizationId));
      }
      if (input?.action?.trim()) {
        conditions.push(eq(auditEvent.action, input.action.trim()));
      }
      if (input?.source?.trim()) {
        conditions.push(eq(auditEvent.source, input.source.trim()));
      }

      const where = conditions.length ? and(...conditions) : undefined;

      const [[countRow], rows] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(auditEvent)
          .where(where),
        db
          .select({
            id: auditEvent.id,
            action: auditEvent.action,
            result: auditEvent.result,
            source: auditEvent.source,
            actorUserId: auditEvent.actorUserId,
            actorEmail: user.email,
            organizationId: auditEvent.organizationId,
            organizationName: organization.name,
            createdAt: auditEvent.createdAt,
          })
          .from(auditEvent)
          .leftJoin(user, eq(auditEvent.actorUserId, user.id))
          .leftJoin(
            organization,
            eq(auditEvent.organizationId, organization.id),
          )
          .where(where)
          .orderBy(desc(auditEvent.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      return {
        items: rows.map((row) => ({
          id: row.id,
          action: row.action,
          result: row.result,
          source: row.source,
          actorUserId: row.actorUserId,
          actorEmail: row.actorEmail,
          organizationId: row.organizationId,
          organizationName: row.organizationName,
          createdAt: toIsoString(row.createdAt),
        })),
        total: countRow?.count ?? 0,
        limit,
        offset,
      };
    }),

  getAuditEvent: consoleProcedure
    .input(z.object({ eventId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertPlatformOperatorList(ctx.session.user.id);

      const [row] = await db
        .select({
          id: auditEvent.id,
          action: auditEvent.action,
          result: auditEvent.result,
          source: auditEvent.source,
          actorUserId: auditEvent.actorUserId,
          actorEmail: user.email,
          actorName: user.name,
          organizationId: auditEvent.organizationId,
          organizationName: organization.name,
          projectId: auditEvent.projectId,
          environmentId: auditEvent.environmentId,
          entityType: auditEvent.entityType,
          entityId: auditEvent.entityId,
          entitySlug: auditEvent.entitySlug,
          targetUserId: auditEvent.targetUserId,
          denialReason: auditEvent.denialReason,
          errorCode: auditEvent.errorCode,
          payload: auditEvent.payload,
          ipAddress: auditEvent.ipAddress,
          userAgent: auditEvent.userAgent,
          durationMs: auditEvent.durationMs,
          mcpTool: auditEvent.mcpTool,
          oauthClientId: auditEvent.oauthClientId,
          createdAt: auditEvent.createdAt,
        })
        .from(auditEvent)
        .leftJoin(user, eq(auditEvent.actorUserId, user.id))
        .leftJoin(organization, eq(auditEvent.organizationId, organization.id))
        .where(eq(auditEvent.id, input.eventId))
        .limit(1);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audit event not found",
        });
      }

      return {
        ...row,
        createdAt: toIsoString(row.createdAt),
        payload: row.payload ?? {},
      };
    }),
});
