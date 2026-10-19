import { isActionsAuditEnabled } from "@loftlancer/actions";
import { db } from "@loftlancer/db";
import { auditEvent } from "@loftlancer/db/schema/audit-event";
import { user } from "@loftlancer/db/schema/auth";
import { organization } from "@loftlancer/db/schema/organization";
import { project } from "@loftlancer/db/schema/projects";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  gte,
  isNull,
  lt,
  lte,
  ne,
  type SQL,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const targetUser = alias(user, "target_user");

import { z } from "zod/v3";
import { requireAction } from "../actions/require-action";
import { passiveActionSqlFilter } from "../audit-passive-actions";
import { orgAwareProcedure, router } from "../index";
import { getActiveOrganizationId } from "../org-access";

const listInput = z.object({
  scope: z.enum(["org", "project", "self", "user"]),
  targetUserId: z.string().optional(),
  projectId: z.string().optional(),
  actorUserId: z.string().optional(),
  action: z.string().optional(),
  result: z.enum(["success", "failure", "denied"]).optional(),
  excludePassive: z.boolean().optional(),
  /** Hide permission-denied probes (e.g. account.delete checks) from the default feed. */
  excludeDenied: z.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export const auditEventsRouter = router({
  list: orgAwareProcedure.input(listInput).query(async ({ ctx, input }) => {
    if (!isActionsAuditEnabled()) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Audit timeline is not enabled.",
      });
    }

    const organizationId = getActiveOrganizationId(ctx.session);
    const userId = ctx.session.user.id;

    if (input.scope === "project") {
      if (!organizationId || !input.projectId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select a project first.",
        });
      }
      const [projectRow] = await db
        .select({ id: project.id })
        .from(project)
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.organizationId, organizationId),
            isNull(project.deletedAt),
          ),
        )
        .limit(1);
      if (!projectRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      await requireAction("audit.timeline.view.project", {
        userId,
        organizationId,
        projectId: input.projectId,
        audit: false,
      });
    } else if (input.scope === "self") {
      await requireAction("audit.timeline.view.self", {
        userId,
        organizationId,
        audit: false,
      });
    } else if (input.scope === "org") {
      await requireAction("audit.timeline.view.org", {
        userId,
        organizationId,
        audit: false,
      });
    } else if (input.scope === "user") {
      await requireAction("audit.timeline.view.user", {
        userId,
        organizationId,
        audit: false,
        targetUserId: input.targetUserId,
      });
    }

    const conditions: SQL[] = [];

    if (input.scope === "project") {
      if (!organizationId || !input.projectId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select a project first.",
        });
      }
      conditions.push(eq(auditEvent.organizationId, organizationId));
      conditions.push(eq(auditEvent.projectId, input.projectId));
    } else if (input.scope === "self") {
      conditions.push(eq(auditEvent.actorUserId, userId));
    } else if (input.scope === "user" && input.targetUserId) {
      conditions.push(eq(auditEvent.actorUserId, input.targetUserId));
    } else if (input.scope === "org" && organizationId) {
      conditions.push(eq(auditEvent.organizationId, organizationId));
    }

    if (input.projectId) {
      conditions.push(eq(auditEvent.projectId, input.projectId));
    }
    if (input.actorUserId) {
      conditions.push(eq(auditEvent.actorUserId, input.actorUserId));
    }
    if (input.action) {
      conditions.push(eq(auditEvent.action, input.action));
    }
    if (input.result) {
      conditions.push(eq(auditEvent.result, input.result));
    }
    if (input.excludePassive ?? true) {
      conditions.push(passiveActionSqlFilter());
    }
    if (input.excludeDenied ?? true) {
      conditions.push(ne(auditEvent.result, "denied"));
    }
    if (input.cursor) {
      // Keyset cursor "<iso>|<id>"; a bare ISO string is accepted for old clients.
      const [iso, cursorId] = input.cursor.split("|");
      const at = new Date(iso ?? "");
      if (!Number.isNaN(at.getTime())) {
        conditions.push(
          cursorId
            ? sql`(${auditEvent.createdAt}, ${auditEvent.id}) < (${at.toISOString()}::timestamptz, ${cursorId})`
            : lte(auditEvent.createdAt, at),
        );
      }
    }

    const rows = await db
      .select({
        id: auditEvent.id,
        action: auditEvent.action,
        result: auditEvent.result,
        actorUserId: auditEvent.actorUserId,
        actorName: user.name,
        actorEmail: user.email,
        actorImage: user.image,
        organizationId: auditEvent.organizationId,
        projectId: auditEvent.projectId,
        projectName: project.name,
        projectSlug: project.slug,
        organizationSlug: organization.slug,
        environmentId: auditEvent.environmentId,
        entityType: auditEvent.entityType,
        entityId: auditEvent.entityId,
        entitySlug: auditEvent.entitySlug,
        targetUserId: auditEvent.targetUserId,
        targetUserName: targetUser.name,
        denialReason: auditEvent.denialReason,
        errorCode: auditEvent.errorCode,
        payload: auditEvent.payload,
        ipAddress: auditEvent.ipAddress,
        userAgent: auditEvent.userAgent,
        durationMs: auditEvent.durationMs,
        createdAt: auditEvent.createdAt,
      })
      .from(auditEvent)
      .leftJoin(user, eq(auditEvent.actorUserId, user.id))
      .leftJoin(project, eq(auditEvent.projectId, project.id))
      .leftJoin(organization, eq(auditEvent.organizationId, organization.id))
      .leftJoin(targetUser, eq(auditEvent.targetUserId, targetUser.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(auditEvent.createdAt), desc(auditEvent.id))
      .limit(input.limit + 1);

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? `${lastItem.createdAt.toISOString()}|${lastItem.id}`
        : undefined;

    return { items, nextCursor };
  }),

  stats: orgAwareProcedure
    .input(z.object({ scope: z.enum(["org", "self"]).default("org") }))
    .query(async ({ ctx, input }) => {
      if (!isActionsAuditEnabled()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Audit timeline is not enabled.",
        });
      }

      const organizationId = getActiveOrganizationId(ctx.session);
      const userId = ctx.session.user.id;

      if (input.scope === "self") {
        await requireAction("audit.timeline.view.self", {
          userId,
          organizationId,
          audit: false,
        });
      } else {
        await requireAction("audit.timeline.view.org", {
          userId,
          organizationId,
          audit: false,
        });
      }

      const base =
        input.scope === "self"
          ? eq(auditEvent.actorUserId, userId)
          : organizationId
            ? eq(auditEvent.organizationId, organizationId)
            : eq(auditEvent.actorUserId, userId);

      const rows = await db
        .select({
          result: auditEvent.result,
          action: auditEvent.action,
        })
        .from(auditEvent)
        .where(base)
        .limit(5000);

      const byResult: Record<string, number> = {};
      const byAction: Record<string, number> = {};
      for (const row of rows) {
        byResult[row.result] = (byResult[row.result] ?? 0) + 1;
        byAction[row.action] = (byAction[row.action] ?? 0) + 1;
      }

      return { total: rows.length, byResult, byAction };
    }),
  /**
   * Per-day event counts (in the viewer's time zone) for one calendar year, for the activity heatmap.
   * Same scope + permission rules as `stats`; passive and denied events excluded.
   */
  heatmap: orgAwareProcedure
    .input(
      z.object({
        scope: z.enum(["org", "self"]).default("self"),
        year: z.number().int().min(2000).max(2100).optional(),
        /** IANA zone the viewer buckets days in (e.g. Asia/Calcutta). */
        timeZone: z
          .string()
          .max(64)
          .regex(/^[A-Za-z0-9_+\-/]+$/)
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let tz = "UTC";
      if (input.timeZone) {
        try {
          new Intl.DateTimeFormat("en", { timeZone: input.timeZone });
          tz = input.timeZone;
        } catch {
          tz = "UTC";
        }
      }
      if (!isActionsAuditEnabled()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Audit timeline is not enabled.",
        });
      }
      const organizationId = getActiveOrganizationId(ctx.session);
      const userId = ctx.session.user.id;
      await requireAction(
        input.scope === "self"
          ? "audit.timeline.view.self"
          : "audit.timeline.view.org",
        { userId, organizationId, audit: false },
      );
      const base =
        input.scope === "self"
          ? eq(auditEvent.actorUserId, userId)
          : organizationId
            ? eq(auditEvent.organizationId, organizationId)
            : eq(auditEvent.actorUserId, userId);
      const filters = and(
        base,
        passiveActionSqlFilter(),
        ne(auditEvent.result, "denied"),
      );

      const yearExpr = sql<number>`extract(year from ${auditEvent.createdAt} at time zone ${tz})::int`;
      const yearRows = await db
        .selectDistinct({ year: yearExpr })
        .from(auditEvent)
        .where(filters);
      const currentYear = Number(
        new Intl.DateTimeFormat("en", { timeZone: tz, year: "numeric" }).format(
          new Date(),
        ),
      );
      const years = Array.from(
        new Set([currentYear, ...yearRows.map((r) => Number(r.year))]),
      ).sort((a, b) => b - a);
      const year = input.year ?? currentYear;

      const dayExpr = sql<string>`to_char(${auditEvent.createdAt} at time zone ${tz}, 'YYYY-MM-DD')`;
      const rows = await db
        .select({ date: dayExpr, count: sql<number>`count(*)::int` })
        .from(auditEvent)
        .where(
          and(
            filters,
            // ±1 day margin covers any zone offset; exact year filter below.
            gte(
              auditEvent.createdAt,
              new Date(Date.UTC(year, 0, 1) - 86_400_000),
            ),
            lt(
              auditEvent.createdAt,
              new Date(Date.UTC(year + 1, 0, 1) + 86_400_000),
            ),
            sql`${yearExpr} = ${year}`,
          ),
        )
        .groupBy(dayExpr);

      const days = rows
        .map((r) => ({ date: String(r.date), count: Number(r.count) }))
        .sort((a, b) => a.date.localeCompare(b.date));
      return {
        year,
        years,
        days,
        total: days.reduce((sum, d) => sum + d.count, 0),
      };
    }),
});
