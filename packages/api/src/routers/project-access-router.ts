import {
  isProjectMemberGrantKey,
  PROJECT_MEMBER_GRANT_KEYS,
} from "@loftlancer/actions";
import { activeMemberWhere, db } from "@loftlancer/db";
import { member } from "@loftlancer/db/schema/organization";
import { projectMemberGrant } from "@loftlancer/db/schema/project-access";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { orgProcedure, router } from "../index";
import { assertProjectAccess } from "../org-access";
import {
  loadProjectAccessSummary,
  softDeleteProjectManager,
  softDeleteProjectTeamLink,
  upsertProjectManagerRow,
  upsertProjectTeamLink,
} from "../project-access/service";

const projectIdInput = z.object({ projectId: z.string() });

export const projectAccessRouter = router({
  getSummary: orgProcedure
    .input(projectIdInput)
    .use(
      actionGuard("project.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        ctx.activeOrganizationId,
      );
      return loadProjectAccessSummary(input.projectId);
    }),

  grantTemplate: orgProcedure.query(() => ({
    keys: [...PROJECT_MEMBER_GRANT_KEYS],
  })),

  listManagers: orgProcedure
    .input(projectIdInput)
    .use(
      actionGuard("project.read", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .query(async ({ ctx, input }) => {
      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        ctx.activeOrganizationId,
      );
      const summary = await loadProjectAccessSummary(input.projectId);
      return { items: summary.managers };
    }),

  assignManager: orgProcedure
    .input(z.object({ projectId: z.string(), userId: z.string() }))
    .use(
      actionGuard("project.assign_manager", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }
      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        organizationId,
      );

      const [target] = await db
        .select({ id: member.id })
        .from(member)
        .where(
          activeMemberWhere(
            and(
              eq(member.organizationId, organizationId),
              eq(member.userId, input.userId),
            ),
          ),
        )
        .limit(1);
      if (!target) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project managers must be active organization members",
        });
      }

      return upsertProjectManagerRow({
        organizationId,
        projectId: input.projectId,
        userId: input.userId,
        createdBy: ctx.session.user.id,
      });
    }),

  removeManager: orgProcedure
    .input(z.object({ projectId: z.string(), userId: z.string() }))
    .use(
      actionGuard("project.assign_manager", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }
      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        organizationId,
      );
      return softDeleteProjectManager({
        projectId: input.projectId,
        userId: input.userId,
        actorUserId: ctx.session.user.id,
      });
    }),

  setMemberGrants: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        grants: z.array(z.string()),
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
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }

      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        organizationId,
      );
      const [target] = await db
        .select({ id: member.id })
        .from(member)
        .where(
          activeMemberWhere(
            and(
              eq(member.organizationId, organizationId),
              eq(member.userId, input.userId),
            ),
          ),
        )
        .limit(1);
      if (!target) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Permission grants require an active organization member",
        });
      }

      if (input.grants.some((grant) => !isProjectMemberGrantKey(grant))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more project permission grants are invalid",
        });
      }
      const grants = input.grants;

      const [existing] = await db
        .select({ id: projectMemberGrant.id })
        .from(projectMemberGrant)
        .where(
          and(
            eq(projectMemberGrant.projectId, input.projectId),
            eq(projectMemberGrant.userId, input.userId),
            isNull(projectMemberGrant.deletedAt),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(projectMemberGrant)
          .set({
            grants,
            updatedBy: ctx.session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(projectMemberGrant.id, existing.id));
      } else {
        await db.insert(projectMemberGrant).values({
          id: crypto.randomUUID(),
          organizationId,
          projectId: input.projectId,
          userId: input.userId,
          grants,
          updatedBy: ctx.session.user.id,
        });
      }

      return { ok: true };
    }),

  assignTeam: orgProcedure
    .input(z.object({ projectId: z.string(), teamId: z.string() }))
    .use(
      actionGuard("project.assign_team", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }

      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        organizationId,
      );

      return upsertProjectTeamLink({
        organizationId,
        projectId: input.projectId,
        teamId: input.teamId,
        createdBy: ctx.session.user.id,
      });
    }),

  removeTeam: orgProcedure
    .input(z.object({ projectId: z.string(), teamId: z.string() }))
    .use(
      actionGuard("project.assign_team", (input) => ({
        projectId: (input as { projectId: string }).projectId,
      })),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active org" });
      }
      await assertProjectAccess(
        ctx.session.user.id,
        input.projectId,
        organizationId,
      );
      return softDeleteProjectTeamLink({
        organizationId,
        projectId: input.projectId,
        teamId: input.teamId,
        actorUserId: ctx.session.user.id,
      });
    }),
});
