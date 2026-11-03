import { db } from "@loftlancer/drizzle";
import { auditLog } from "@loftlancer/drizzle/schema/audit";
import {
  auditLogOutput,
  listAuditLogsInput,
  makeResponseSchema,
  respond,
} from "@modules/projects/utils/validation/utils.project-environment.validation";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { protectedProcedure, router } from "../index";
import {
  actionCountsFromGroupAggregate,
  totalFromCountAggregate,
} from "./audit-stats-mappers";
import { buildAuditStatsWhereConditions } from "./audit-stats-scope";

export const auditLogsRouter = router({
  list: protectedProcedure
    .input(listAuditLogsInput)
    .use(actionGuard("audit.timeline.view.self"))
    .output(makeResponseSchema(z.array(auditLogOutput)))
    .query(async ({ ctx, input }) => {
      // Build where conditions for filtering and access control
      const whereConditions = [eq(auditLog.userId, ctx.session.user.id)];

      // Add optional filters
      if (input.projectId) {
        whereConditions.push(eq(auditLog.projectId, input.projectId));
      }

      if (input.environmentId) {
        whereConditions.push(eq(auditLog.environmentId, input.environmentId));
      }

      if (input.action) {
        whereConditions.push(eq(auditLog.action, input.action));
      }

      if (input.entityType) {
        whereConditions.push(eq(auditLog.entityType, input.entityType));
      }

      if (input.search) {
        const searchPattern = `%${input.search}%`;
        whereConditions.push(
          or(
            ilike(auditLog.action, searchPattern),
            ilike(auditLog.entityType, searchPattern),
          ) as SQL,
        );
      }

      // Query audit logs with proper access control
      const logs = await db
        .select({
          id: auditLog.id,
          userId: auditLog.userId,
          projectId: auditLog.projectId,
          environmentId: auditLog.environmentId,
          variableId: auditLog.variableId,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entitySlug: auditLog.entitySlug,
          oldValue: auditLog.oldValue,
          newValue: auditLog.newValue,
          ipAddress: auditLog.ipAddress,
          userAgent: auditLog.userAgent,
          metadata: auditLog.metadata,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .where(and(...whereConditions))
        .orderBy(desc(auditLog.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return respond({
        message: "Audit logs fetched successfully",
        data: logs,
      });
    }),

  // Get audit log statistics for dashboard
  stats: protectedProcedure
    .input(z.object({ projectId: z.string().uuid().optional() }))
    .use(actionGuard("audit.timeline.view.self"))
    .output(
      makeResponseSchema(
        z.object({
          totalLogs: z.number(),
          recentActivity: z.array(auditLogOutput),
          actionCounts: z.record(z.number()),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const whereConditions = buildAuditStatsWhereConditions({
        userId: ctx.session.user.id,
        projectId: input.projectId,
      });

      const totalLogsResult = await db
        .select({ count: count() })
        .from(auditLog)
        .where(and(...whereConditions));

      const totalLogs = totalFromCountAggregate(totalLogsResult);

      // Get recent activity (last 10)
      const recentActivity = await db
        .select({
          id: auditLog.id,
          userId: auditLog.userId,
          projectId: auditLog.projectId,
          environmentId: auditLog.environmentId,
          variableId: auditLog.variableId,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entitySlug: auditLog.entitySlug,
          oldValue: auditLog.oldValue,
          newValue: auditLog.newValue,
          ipAddress: auditLog.ipAddress,
          userAgent: auditLog.userAgent,
          metadata: auditLog.metadata,
          createdAt: auditLog.createdAt,
        })
        .from(auditLog)
        .where(and(...whereConditions))
        .orderBy(desc(auditLog.createdAt))
        .limit(10);

      // Get action counts
      const actionCountsResult = await db
        .select({
          action: auditLog.action,
          count: count(),
        })
        .from(auditLog)
        .where(and(...whereConditions))
        .groupBy(auditLog.action);

      const actionCounts = actionCountsFromGroupAggregate(actionCountsResult);

      return respond({
        message: "Audit statistics fetched successfully",
        data: {
          totalLogs,
          recentActivity,
          actionCounts,
        },
      });
    }),
});
