import { isActionsAuditEnabled } from "@loftlancer/actions";
import { activeMemberWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/db/schema/organization";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, isNull, lte, type SQL, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { requireAction } from "../actions/require-action";
import {
  orgAwareProcedure,
  orgProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../index";
import { getPublicInvitationStatus } from "../invitation-preview";
import { mcpMembersList } from "../mcp/organization-ops";

export const organizationsRouter = router({
  /**
   * Public invitation landing preview. The invite ID is a random bearer link;
   * never return the recipient email or any other account data here.
   */
  getInvitationPreview: publicProcedure
    .input(z.object({ invitationId: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          status: invitation.status,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          invitationDeletedAt: invitation.deletedAt,
          organizationDeletedAt: organization.deletedAt,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          inviterName: user.name,
        })
        .from(invitation)
        .innerJoin(organization, eq(invitation.organizationId, organization.id))
        .leftJoin(user, eq(invitation.inviterId, user.id))
        .where(eq(invitation.id, input.invitationId))
        .limit(1);

      if (!row) return { status: "not_found" as const };
      return {
        status: getPublicInvitationStatus({
          status: row.status,
          expiresAt: row.expiresAt,
          deletedAt: row.invitationDeletedAt,
          organizationDeletedAt: row.organizationDeletedAt,
        }),
        organizationName: row.organizationName,
        organizationSlug: row.organizationSlug,
        role: row.role,
        inviterName: row.inviterName,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (isActionsAuditEnabled()) {
      await requireAction("organization.list", { userId, audit: false });
    }

    const rows = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        role: member.role,
        createdAt: organization.createdAt,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        activeMemberWhere(
          and(eq(member.userId, userId), isNull(organization.deletedAt)),
        ),
      );

    return { items: rows };
  }),

  getBySlug: orgAwareProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [row] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          role: member.role,
        })
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .where(
          activeMemberWhere(
            and(
              eq(organization.slug, input.slug),
              eq(member.userId, userId),
              isNull(organization.deletedAt),
            ),
          ),
        )
        .limit(1);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      if (isActionsAuditEnabled()) {
        await requireAction("organization.hub.view", {
          userId,
          organizationId: row.id,
          audit: false,
        });
      }

      return row;
    }),

  listMembers: orgProcedure
    .use(actionGuard("member.list"))
    .query(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        return { items: [] };
      }
      return mcpMembersList(ctx.session.user.id, organizationId);
    }),

  /** Server-side paginated invitations with status filter (#261). Better
   * Auth's listInvitations caps at 100 rows. */
  listInvitations: orgProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        status: z
          .enum([
            "all",
            "pending",
            "expired",
            "accepted",
            "rejected",
            "canceled",
          ])
          .default("all"),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      await requireAction("member.list", {
        userId: ctx.session.user.id,
        organizationId: input.organizationId,
        audit: false,
      });
      const now = new Date();
      const org = eq(invitation.organizationId, input.organizationId);
      const byStatus: Record<string, SQL | undefined> = {
        all: org,
        pending: and(
          org,
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, now),
        ),
        expired: and(
          org,
          eq(invitation.status, "pending"),
          lte(invitation.expiresAt, now),
        ),
        accepted: and(org, eq(invitation.status, "accepted")),
        rejected: and(org, eq(invitation.status, "rejected")),
        canceled: and(org, eq(invitation.status, "canceled")),
      };
      const where = byStatus[input.status];
      const [rows, counts] = await Promise.all([
        db
          .select({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
          })
          .from(invitation)
          .where(where)
          .orderBy(desc(invitation.expiresAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({
            all: sql<number>`count(*)::int`,
            pending: sql<number>`count(*) filter (where ${invitation.status} = 'pending' and ${invitation.expiresAt} > ${now})::int`,
            expired: sql<number>`count(*) filter (where ${invitation.status} = 'pending' and ${invitation.expiresAt} <= ${now})::int`,
            accepted: sql<number>`count(*) filter (where ${invitation.status} = 'accepted')::int`,
            rejected: sql<number>`count(*) filter (where ${invitation.status} = 'rejected')::int`,
            canceled: sql<number>`count(*) filter (where ${invitation.status} = 'canceled')::int`,
          })
          .from(invitation)
          .where(org),
      ]);
      const c = counts[0] ?? {
        all: 0,
        pending: 0,
        expired: 0,
        accepted: 0,
        rejected: 0,
        canceled: 0,
      };
      return { rows, counts: c, total: c[input.status] ?? 0 };
    }),
});
