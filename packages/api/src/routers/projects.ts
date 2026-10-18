import {
  activeEnvironmentWhere,
  db,
  softDeleteProjectById,
} from "@loftlancer/db";
import { environment, project } from "@loftlancer/db/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { projectIdFromInput } from "../actions/guard-resolve";
import { createAuditLog } from "../audit";
import { throwFriendlyError } from "../errors";
import { orgProcedure, router } from "../index";
import { formatEnvironmentRows } from "../variable-format";
import { isVariablesV2Enabled } from "../variables-v2";

const baseEnvironmentSelect = {
  id: environment.id,
  name: environment.name,
  slug: environment.slug,
  branch: environment.branch,
  deployedUrl: environment.deployedUrl,
  status: environment.status,
  isProduction: environment.isProduction,
  description: environment.description,
  projectId: environment.projectId,
  createdAt: environment.createdAt,
  updatedAt: environment.updatedAt,
};

async function listProjectEnvironments(projectId: string) {
  const where = activeEnvironmentWhere(eq(environment.projectId, projectId));

  if (isVariablesV2Enabled()) {
    return db
      .select({
        ...baseEnvironmentSelect,
        createdById: environment.createdBy,
        updatedById: environment.updatedBy,
      })
      .from(environment)
      .where(where)
      .orderBy(environment.name);
  }

  return db
    .select(baseEnvironmentSelect)
    .from(environment)
    .where(where)
    .orderBy(environment.name);
}

import {
  assertProjectAccess,
  attachProjectToOrganization,
} from "../org-access";
import { findReadableProjectIdBySlug, projectReadWhere } from "../project-list";
import { assertUniqueProjectName } from "../project-name";
import {
  buildProjectSlugFromName,
  ensureUniqueProjectSlug,
} from "../project-slug";
import {
  changeProjectStatusInput,
  createProjectInput,
  environmentOutput,
  getProjectBySlugInput,
  getProjectInput,
  makeResponseSchema,
  projectOutput,
  respond,
  toggleProjectPublicInput,
  updateProjectInput,
} from "../validation";

export const projectsRouter = router({
  // List all projects for the authenticated user
  list: orgProcedure
    .use(actionGuard("organization.list"))
    .output(makeResponseSchema(z.array(projectOutput)))
    .query(async ({ ctx }) => {
      const readScope = await projectReadWhere(
        ctx.session.user.id,
        ctx.activeOrganizationId,
      );
      const projectsList = await db
        .select()
        .from(project)
        .where(readScope)
        .orderBy(project.updatedAt);

      return respond({ message: "Projects fetched", data: projectsList });
    }),

  // Get a single project with its environments by ID
  get: orgProcedure
    .input(getProjectInput)
    .use(actionGuard("project.read", projectIdFromInput))
    .output(
      makeResponseSchema(
        z.object({
          project: projectOutput.nullable(),
          environments: z.array(environmentOutput),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      await assertProjectAccess(ctx.session.user.id, input.id, organizationId);
      const readScope = await projectReadWhere(
        ctx.session.user.id,
        organizationId,
      );
      const projectData = await db
        .select({
          id: project.id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          isArchived: project.isArchived,
          isPublic: project.isPublic,
          repositoryUrl: project.repositoryUrl,
          websiteUrl: project.websiteUrl,
          status: project.status,
          userId: project.userId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })
        .from(project)
        .where(and(eq(project.id, input.id), readScope))
        .limit(1);

      const environmentsList = await listProjectEnvironments(input.id);

      const projectRecord = projectData[0];
      const formattedEnvironments = projectRecord
        ? await formatEnvironmentRows(environmentsList)
        : [];

      return respond({
        message: "Project fetched",
        data: {
          project: projectRecord || null,
          environments: formattedEnvironments,
        },
      });
    }),

  // Get a single project with its environments by slug
  getBySlug: orgProcedure
    .input(getProjectBySlugInput)
    .use(
      actionGuard("project.read", async (input, ctx) => {
        const slug =
          input && typeof input === "object" && "slug" in input
            ? String((input as { slug: string }).slug)
            : null;
        if (!slug) return {};
        const projectId = await findReadableProjectIdBySlug(
          ctx.session.user.id,
          ctx.activeOrganizationId ?? null,
          slug,
        );
        return { projectId };
      }),
    )
    .output(
      makeResponseSchema(
        z.object({
          project: projectOutput.nullable(),
          environments: z.array(environmentOutput),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      const readScope = await projectReadWhere(
        ctx.session.user.id,
        organizationId,
      );
      const projectData = await db
        .select({
          id: project.id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          isArchived: project.isArchived,
          isPublic: project.isPublic,
          repositoryUrl: project.repositoryUrl,
          websiteUrl: project.websiteUrl,
          status: project.status,
          userId: project.userId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })
        .from(project)
        .where(and(eq(project.slug, input.slug), readScope))
        .limit(1);

      if (projectData.length === 0) {
        return respond({
          message: "Project not found",
          data: {
            project: null,
            environments: [],
          },
        });
      }

      const environmentsList = await listProjectEnvironments(
        projectData[0]?.id || "",
      );

      const formattedEnvironments =
        await formatEnvironmentRows(environmentsList);

      return respond({
        message: "Project fetched",
        data: {
          project: projectData[0] || null,
          environments: formattedEnvironments,
        },
      });
    }),

  // Create a new project
  create: orgProcedure
    .input(createProjectInput)
    .use(actionGuard("project.create"))
    .output(makeResponseSchema(projectOutput))
    .mutation(async ({ ctx, input }) => {
      try {
        await assertUniqueProjectName(ctx.session.user.id, input.name);
        const baseSlug = buildProjectSlugFromName(input.name);
        const slug = await ensureUniqueProjectSlug(
          baseSlug,
          ctx.activeOrganizationId ?? null,
        );

        const newProject = await db
          .insert(project)
          .values({
            id: crypto.randomUUID(),
            name: input.name.trim(),
            description: input.description?.trim() || null,
            repositoryUrl: input.repositoryUrl || null,
            websiteUrl: input.websiteUrl || null,
            isPublic: input.isPublic ?? false,
            slug,
            userId: ctx.session.user.id,
            organizationId: ctx.activeOrganizationId ?? null,
          })
          .returning();

        if (!newProject[0]) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        if (ctx.activeOrganizationId && !newProject[0].organizationId) {
          await attachProjectToOrganization(
            newProject[0].id,
            ctx.activeOrganizationId,
          );
        }

        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: newProject[0].id,
          action: "CREATE",
          entityType: "PROJECT",
          entitySlug: newProject[0].slug,
          newValue: JSON.stringify({
            name: newProject[0].name,
            slug: newProject[0].slug,
          }),
        });

        return respond({ message: "Project created", data: newProject[0] });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throwFriendlyError(error, {
          fallback: "Unable to create project. Please try again.",
          code: "BAD_REQUEST",
        });
      }
    }),

  // Update a project
  update: orgProcedure
    .input(updateProjectInput)
    .use(actionGuard("project.update", projectIdFromInput))
    .output(makeResponseSchema(projectOutput))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      await assertProjectAccess(ctx.session.user.id, input.id, organizationId);
      const existingProject = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.id),
            await projectReadWhere(ctx.session.user.id, organizationId),
          ),
        )
        .limit(1);

      if (existingProject.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) {
        const trimmedName = input.name.trim();
        await assertUniqueProjectName(
          ctx.session.user.id,
          trimmedName,
          input.id,
        );
        updateData.name = trimmedName;
      }
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.repositoryUrl !== undefined)
        updateData.repositoryUrl = input.repositoryUrl || null;
      if (input.websiteUrl !== undefined)
        updateData.websiteUrl = input.websiteUrl || null;
      if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

      try {
        const updatedProject = await db
          .update(project)
          .set(updateData)
          .where(eq(project.id, input.id))
          .returning();

        if (!updatedProject[0]) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update project",
          });
        }

        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: updatedProject[0].id,
          action: "UPDATE",
          entityType: "PROJECT",
          entitySlug: updatedProject[0].slug,
          newValue: JSON.stringify({
            name: updatedProject[0].name,
            slug: updatedProject[0].slug,
          }),
        });

        return respond({ message: "Project updated", data: updatedProject[0] });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throwFriendlyError(error, {
          fallback: "Unable to update project. Please try again.",
          code: "BAD_REQUEST",
        });
      }
    }),

  // Delete a project (and all its environments and variables)
  delete: orgProcedure
    .input(getProjectInput)
    .use(actionGuard("project.delete", projectIdFromInput))
    .output(makeResponseSchema(z.object({ success: z.boolean() })))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      await assertProjectAccess(ctx.session.user.id, input.id, organizationId);
      const existingProject = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.id),
            await projectReadWhere(ctx.session.user.id, organizationId),
          ),
        )
        .limit(1);

      if (existingProject.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const slug = existingProject[0]?.slug;

      await softDeleteProjectById(input.id, ctx.session.user.id);

      await createAuditLog({
        userId: ctx.session.user.id,
        projectId: input.id,
        action: "DELETE",
        entityType: "PROJECT",
        entitySlug: slug ?? null,
        oldValue: JSON.stringify({ name: existingProject[0]?.name }),
      });

      return respond({ message: "Project deleted", data: { success: true } });
    }),

  // Archive a project
  archive: orgProcedure
    .input(getProjectInput)
    .use(actionGuard("project.archive", projectIdFromInput))
    .output(makeResponseSchema(projectOutput))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      await assertProjectAccess(ctx.session.user.id, input.id, organizationId);
      const existingProject = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.id),
            await projectReadWhere(ctx.session.user.id, organizationId),
          ),
        )
        .limit(1);

      if (existingProject.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const archivedProject = await db
        .update(project)
        .set({ isArchived: true })
        .where(eq(project.id, input.id))
        .returning();

      if (!archivedProject[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to archive project",
        });
      }

      return respond({ message: "Project archived", data: archivedProject[0] });
    }),

  // Unarchive a project
  unarchive: orgProcedure
    .input(getProjectInput)
    .use(actionGuard("project.unarchive", projectIdFromInput))
    .output(makeResponseSchema(projectOutput))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      await assertProjectAccess(ctx.session.user.id, input.id, organizationId);
      const existingProject = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.id),
            await projectReadWhere(ctx.session.user.id, organizationId),
          ),
        )
        .limit(1);

      if (existingProject.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const unarchivedProject = await db
        .update(project)
        .set({ isArchived: false })
        .where(eq(project.id, input.id))
        .returning();

      if (!unarchivedProject[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unarchive project",
        });
      }

      return respond({
        message: "Project unarchived",
        data: unarchivedProject[0],
      });
    }),

  // Change project status
  changeStatus: orgProcedure
    .input(changeProjectStatusInput)
    .use(actionGuard("project.status.change", projectIdFromInput))
    .output(makeResponseSchema(projectOutput))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      await assertProjectAccess(ctx.session.user.id, input.id, organizationId);
      const existingProject = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.id),
            await projectReadWhere(ctx.session.user.id, organizationId),
          ),
        )
        .limit(1);

      if (existingProject.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const updatedProject = await db
        .update(project)
        .set({ status: input.status })
        .where(eq(project.id, input.id))
        .returning();

      if (!updatedProject[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change project status",
        });
      }

      return respond({
        message: "Project status updated",
        data: updatedProject[0],
      });
    }),

  // Toggle project public/private visibility
  togglePublic: orgProcedure
    .input(toggleProjectPublicInput)
    .use(actionGuard("project.public.toggle", projectIdFromInput))
    .output(makeResponseSchema(projectOutput))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.activeOrganizationId ?? null;
      await assertProjectAccess(ctx.session.user.id, input.id, organizationId);
      const existingProject = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.id),
            await projectReadWhere(ctx.session.user.id, organizationId),
          ),
        )
        .limit(1);

      if (existingProject.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const currentProject = existingProject[0];
      if (!currentProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const updatedProject = await db
        .update(project)
        .set({ isPublic: !currentProject.isPublic })
        .where(eq(project.id, input.id))
        .returning();

      if (!updatedProject[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle project visibility",
        });
      }

      return respond({
        message: `Project is now ${updatedProject[0].isPublic ? "public" : "private"}`,
        data: updatedProject[0],
      });
    }),
});
