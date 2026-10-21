import { isActionsAuditEnabled, normalizeOrgRole } from "@loftlancer/actions";
import { sendOrganizationInvitationEmail } from "@loftlancer/auth/organization-invitation-email";
import { activeMemberWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import {
  invitation,
  member,
  organization,
  organizationProfile,
} from "@loftlancer/db/schema/organization";
import { projectTeam } from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team } from "@loftlancer/db/schema/team";
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
import {
  mcpInvitationAccept,
  mcpMemberInvite,
  mcpMembersList,
} from "../mcp/organization-ops";
import { organizationBrandingLogoSchema } from "../organization-branding-validation";
import { transferOrganizationOwnership } from "../organization-ownership";
import { organizationProfilePatchSchema } from "../organization-profile-validation";

export const organizationsRouter = router({
  transferOwnership: orgProcedure
    .input(z.object({ targetUserId: z.string().min(1) }))
    .use(actionGuard("organization.transfer_ownership"))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      return transferOrganizationOwnership({
        actorUserId: ctx.session.user.id,
        organizationId,
        targetUserId: input.targetUserId,
      });
    }),

  /**
   * Public invitation landing preview. The invite ID is a random bearer link;
   * never return the recipient email or any other account data here.
   */
  getInvitationPreview: publicProcedure
    .input(z.object({ invitationId: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          organizationId: invitation.organizationId,
          status: invitation.status,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          invitationDeletedAt: invitation.deletedAt,
          organizationDeletedAt: organization.deletedAt,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          inviterName: user.name,
          projectId: invitation.projectId,
          projectName: project.name,
          projectSlug: project.slug,
          projectDeletedAt: project.deletedAt,
          teamId: invitation.teamId,
          teamName: team.name,
          teamDeletedAt: team.deletedAt,
        })
        .from(invitation)
        .innerJoin(organization, eq(invitation.organizationId, organization.id))
        .leftJoin(user, eq(invitation.inviterId, user.id))
        .leftJoin(
          project,
          and(
            eq(invitation.projectId, project.id),
            eq(invitation.organizationId, project.organizationId),
          ),
        )
        .leftJoin(
          team,
          and(
            eq(invitation.teamId, team.id),
            eq(invitation.organizationId, team.organizationId),
          ),
        )
        .where(eq(invitation.id, input.invitationId))
        .limit(1);

      if (!row) return { status: "not_found" as const };
      const linkedProjects = row.teamId
        ? await db
            .select({ name: project.name, slug: project.slug })
            .from(projectTeam)
            .innerJoin(project, eq(projectTeam.projectId, project.id))
            .where(
              and(
                eq(projectTeam.teamId, row.teamId),
                eq(projectTeam.organizationId, row.organizationId),
                isNull(projectTeam.deletedAt),
                isNull(project.deletedAt),
              ),
            )
            .orderBy(project.name)
        : [];
      return {
        status:
          (row.projectId && row.projectDeletedAt) ||
          (row.teamId && !row.teamName)
            ? ("unavailable" as const)
            : getPublicInvitationStatus({
                status: row.status,
                expiresAt: row.expiresAt,
                deletedAt: row.invitationDeletedAt,
                organizationDeletedAt: row.organizationDeletedAt,
                teamDeletedAt: row.teamDeletedAt,
              }),
        organizationName: row.organizationName,
        organizationSlug: row.organizationSlug,
        role: row.role,
        inviterName: row.inviterName,
        projectId: row.projectId,
        projectName: row.projectName,
        projectSlug: row.projectSlug,
        teamId: row.teamId,
        teamName: row.teamName,
        invitedTeamRole: row.teamId ? ("member" as const) : null,
        linkedProjects,
      };
    }),

  acceptTeamInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Verify your email before accepting this invitation.",
        });
      }
      const [row] = await db
        .select({ teamId: invitation.teamId })
        .from(invitation)
        .where(eq(invitation.id, input.invitationId))
        .limit(1);
      if (!row?.teamId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team invitation not found",
        });
      }
      return mcpInvitationAccept(ctx.session.user.id, input.invitationId);
    }),

  acceptProjectInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Verify your email before accepting this invitation.",
        });
      }
      const [row] = await db
        .select({ projectId: invitation.projectId })
        .from(invitation)
        .where(eq(invitation.id, input.invitationId))
        .limit(1);
      if (!row?.projectId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project invitation not found",
        });
      }
      return mcpInvitationAccept(ctx.session.user.id, input.invitationId);
    }),

  inviteToProject: orgProcedure
    .input(
      z.object({ projectId: z.string().min(1), email: z.string().email() }),
    )
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }
      return mcpMemberInvite(ctx.session.user.id, organizationId, {
        email: input.email,
        role: "member",
        projectId: input.projectId,
      });
    }),

  listProjectInvitations: orgProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        status: z
          .enum([
            "all",
            "pending",
            "expired",
            "accepted",
            "rejected",
            "canceled",
          ])
          .default("pending"),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .use(
      actionGuard("project.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) return { items: [], total: 0 };
      await requireAction("member.list", {
        userId: ctx.session.user.id,
        organizationId,
        audit: false,
      });
      const scope = and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.projectId, input.projectId),
        isNull(invitation.deletedAt),
      );
      const now = new Date();
      const byStatus: Record<string, SQL | undefined> = {
        all: scope,
        pending: and(
          scope,
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, now),
        ),
        expired: and(
          scope,
          eq(invitation.status, "pending"),
          lte(invitation.expiresAt, now),
        ),
        accepted: and(scope, eq(invitation.status, "accepted")),
        rejected: and(scope, eq(invitation.status, "rejected")),
        canceled: and(scope, eq(invitation.status, "canceled")),
      };
      const where = byStatus[input.status];
      const [items, counts] = await Promise.all([
        db
          .select({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            createdAt: invitation.createdAt,
            expiresAt: invitation.expiresAt,
            inviterName: user.name,
          })
          .from(invitation)
          .leftJoin(user, eq(invitation.inviterId, user.id))
          .where(where)
          .orderBy(desc(invitation.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ total: sql<number>`count(*)::int` })
          .from(invitation)
          .where(where),
      ]);
      return { items, total: counts[0]?.total ?? 0 };
    }),

  cancelProjectInvitation: orgProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        invitationId: z.string().min(1),
      }),
    )
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }
      const [row] = await db
        .update(invitation)
        .set({ status: "canceled" })
        .where(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.organizationId, organizationId),
            eq(invitation.projectId, input.projectId),
            eq(invitation.status, "pending"),
          ),
        )
        .returning({ id: invitation.id });
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending invitation not found",
        });
      return { ok: true };
    }),

  resendProjectInvitation: orgProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        invitationId: z.string().min(1),
      }),
    )
    .use(
      actionGuard("project.permission.grant", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }
      await requireAction("member.invite", {
        userId: ctx.session.user.id,
        organizationId,
        audit: false,
      });
      const [row] = await db
        .select({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          projectName: project.name,
          organizationName: organization.name,
        })
        .from(invitation)
        .innerJoin(project, eq(invitation.projectId, project.id))
        .innerJoin(organization, eq(invitation.organizationId, organization.id))
        .where(
          and(
            eq(invitation.id, input.invitationId),
            eq(invitation.projectId, input.projectId),
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, "pending"),
            isNull(invitation.deletedAt),
            isNull(project.deletedAt),
            isNull(organization.deletedAt),
          ),
        )
        .limit(1);
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending invitation not found",
        });
      await db
        .update(invitation)
        .set({ expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        .where(eq(invitation.id, row.id));
      await sendOrganizationInvitationEmail({
        invitationId: row.id,
        email: row.email,
        role: row.role,
        organizationName: `project ${row.projectName} in ${row.organizationName}`,
        inviterName: ctx.session.user.name || ctx.session.user.email,
      });
      return { ok: true };
    }),

  /** Invitations addressed to the signed-in, verified email account. */
  listMyInvitations: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.session.user;
    if (!currentUser.emailVerified) return { items: [] };

    const rows = await db
      .select({
        id: invitation.id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        role: invitation.role,
        inviterName: user.name,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .where(
        and(
          sql`lower(${invitation.email}) = lower(${currentUser.email})`,
          eq(invitation.status, "pending"),
          isNull(invitation.deletedAt),
          isNull(organization.deletedAt),
          gt(invitation.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(invitation.createdAt));

    return { items: rows };
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
        archivedAt: organization.archivedAt,
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
          description: organizationProfile.description,
          websiteUrl: organizationProfile.websiteUrl,
          industry: organizationProfile.industry,
          sizeBand: organizationProfile.sizeBand,
        })
        .from(organization)
        .innerJoin(member, eq(member.organizationId, organization.id))
        .leftJoin(
          organizationProfile,
          eq(organizationProfile.organizationId, organization.id),
        )
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

  getProfile: orgProcedure
    .use(actionGuard("organization.settings.view"))
    .query(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, ctx.session.user.id),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      const canManageProfile = normalizeOrgRole(membership?.role) === "owner";
      const [row] = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
          archivedAt: organization.archivedAt,
          description: organizationProfile.description,
          legalName: organizationProfile.legalName,
          websiteUrl: organizationProfile.websiteUrl,
          industry: organizationProfile.industry,
          sizeBand: organizationProfile.sizeBand,
          foundedYear: organizationProfile.foundedYear,
          contactEmail: organizationProfile.contactEmail,
          contactPhone: organizationProfile.contactPhone,
          supportUrl: organizationProfile.supportUrl,
          countryCode: organizationProfile.countryCode,
          region: organizationProfile.region,
          city: organizationProfile.city,
          postalCode: organizationProfile.postalCode,
          addressLine1: organizationProfile.addressLine1,
          addressLine2: organizationProfile.addressLine2,
        })
        .from(organization)
        .leftJoin(
          organizationProfile,
          eq(organizationProfile.organizationId, organization.id),
        )
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found.",
        });
      }
      return canManageProfile
        ? { ...row, canManageBranding: true }
        : {
            ...row,
            canManageBranding: false,
            legalName: null,
            foundedYear: null,
            contactEmail: null,
            contactPhone: null,
            supportUrl: null,
            countryCode: null,
            region: null,
            city: null,
            postalCode: null,
            addressLine1: null,
            addressLine2: null,
          };
    }),

  updateBrandingLogo: orgProcedure
    .input(z.object({ logo: organizationBrandingLogoSchema }))
    .use(
      actionGuard("organization.settings.update", () => ({
        payload: { surface: "organization_branding", changedFields: ["logo"] },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, ctx.session.user.id),
            isNull(member.deletedAt),
          ),
        )
        .limit(1);
      if (normalizeOrgRole(membership?.role) !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization owners can change branding.",
        });
      }
      const [updated] = await db
        .update(organization)
        .set({
          logo: input.logo,
          updatedAt: new Date(),
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
          ),
        )
        .returning({ id: organization.id });
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found.",
        });
      return { success: true };
    }),

  updateProfile: orgProcedure
    .input(organizationProfilePatchSchema)
    .use(
      actionGuard("organization.settings.update", (input) => ({
        payload: {
          surface: "organization_profile",
          changedFields: Object.keys(input as Record<string, unknown>).sort(),
        },
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const values = {
        ...input,
        countryCode:
          input.countryCode === undefined
            ? undefined
            : (input.countryCode?.toUpperCase() ?? null),
        updatedAt: new Date(),
        updatedBy: ctx.session.user.id,
      };
      await db.transaction(async (tx) => {
        await tx
          .insert(organizationProfile)
          .values({
            organizationId,
            ...values,
          })
          .onConflictDoUpdate({
            target: organizationProfile.organizationId,
            set: values,
          });
        await tx
          .update(organization)
          .set({ updatedAt: new Date(), updatedBy: ctx.session.user.id })
          .where(eq(organization.id, organizationId));
      });
      return { success: true };
    }),

  archive: orgProcedure
    .use(actionGuard("organization.archive"))
    .mutation(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const now = new Date();
      const [row] = await db
        .update(organization)
        .set({
          archivedAt: now,
          archivedBy: ctx.session.user.id,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
            isNull(organization.archivedAt),
          ),
        )
        .returning({ id: organization.id });
      if (!row)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization is already archived or unavailable.",
        });
      return { success: true };
    }),

  unarchive: orgProcedure
    .use(actionGuard("organization.unarchive"))
    .mutation(async ({ ctx }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an organization first.",
        });
      }
      const [row] = await db
        .update(organization)
        .set({
          archivedAt: null,
          archivedBy: null,
          updatedAt: new Date(),
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
            sql`${organization.archivedAt} IS NOT NULL`,
          ),
        )
        .returning({ id: organization.id });
      if (!row)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization is not archived or is unavailable.",
        });
      return { success: true };
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
        teamId: z.string().min(1).optional(),
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
      if (input.teamId) {
        const [teamRow] = await db
          .select({ id: team.id })
          .from(team)
          .where(
            and(
              eq(team.id, input.teamId),
              eq(team.organizationId, input.organizationId),
              isNull(team.deletedAt),
            ),
          )
          .limit(1);
        if (!teamRow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
      }
      const now = new Date();
      const org = and(
        eq(invitation.organizationId, input.organizationId),
        isNull(invitation.projectId),
        input.teamId
          ? eq(invitation.teamId, input.teamId)
          : isNull(invitation.teamId),
      );
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
            teamName: team.name,
            status: invitation.status,
            createdAt: invitation.createdAt,
            expiresAt: invitation.expiresAt,
            inviterName: user.name,
          })
          .from(invitation)
          .leftJoin(user, eq(invitation.inviterId, user.id))
          .leftJoin(team, eq(invitation.teamId, team.id))
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
      const linkedProjects = input.teamId
        ? await db
            .select({ name: project.name })
            .from(projectTeam)
            .innerJoin(project, eq(projectTeam.projectId, project.id))
            .where(
              and(
                eq(projectTeam.teamId, input.teamId),
                eq(projectTeam.organizationId, input.organizationId),
                isNull(projectTeam.deletedAt),
                isNull(project.deletedAt),
              ),
            )
            .orderBy(project.name)
        : [];
      return {
        rows: rows.map((row) => ({
          ...row,
          invitedTeamRole: input.teamId ? ("member" as const) : null,
          linkedProjects: linkedProjects.map(({ name }) => name),
        })),
        counts: c,
        total: c[input.status] ?? 0,
      };
    }),
});
