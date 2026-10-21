import type { ActionName } from "@loftlancer/actions";
import { z } from "zod/v3";
import {
  organizationProfileFieldsSchema,
  safeHttpUrlSchema,
} from "../organization-profile-validation";
import {
  bulkImportVariablesInput,
  changeProjectStatusInput,
  createEnvironmentInput,
  createProjectInput,
  createVariableInput,
  exportVariablesInput,
  getEnvironmentInput,
  getProjectInput,
  getVariableInput,
  toggleProjectPublicInput,
  updateEnvironmentInput,
  updateProjectInput,
  updateVariableInput,
} from "../validation";
import {
  optionalOrganizationRefSchema,
  organizationRefFieldsSchema,
  organizationRefSchema,
} from "./inputs";
import {
  mcpInvitationAccept,
  mcpInvitationCancel,
  mcpInvitationReject,
  mcpMemberInvite,
  mcpMemberRemove,
  mcpMemberSetSuspended,
  mcpMembersList,
  mcpMemberUpdateRole,
  mcpOrganizationCreate,
  mcpOrganizationDelete,
  mcpOrganizationRestore,
  mcpOrganizationTransferOwnership,
  mcpOrganizationUpdate,
  mcpOrganizationView,
  mcpTeamAddMember,
  mcpTeamCreate,
  mcpTeamDelete,
  mcpTeamRemoveMember,
  mcpTeamRestore,
  mcpTeamUpdate,
  resolveOrgFromInput,
} from "./organization-ops";
import {
  mcpEnvironmentRestore,
  mcpProjectRestore,
  mcpVariableRestore,
} from "./restore-ops";
import { createMcpStudioCaller } from "./studio-caller";
import { mcpVariableReadMetadata } from "./variable-read";

export type McpToolContext = {
  userId: string;
  oauthClientId: string | null;
  toolName: string;
};

type HandlerDef = {
  schema: z.ZodTypeAny;
  run: (input: unknown, ctx: McpToolContext) => Promise<unknown>;
};

async function withOrgCaller<T>(
  userId: string,
  input: { organizationId?: string; organizationSlug?: string },
  run: (
    caller: Awaited<ReturnType<typeof createMcpStudioCaller>>,
    organizationId: string,
  ) => Promise<T>,
): Promise<T> {
  const organizationId = await resolveOrgFromInput(userId, input);
  if (!organizationId) {
    throw new Error("organization_required");
  }
  const caller = await createMcpStudioCaller({ userId, organizationId });
  return run(caller, organizationId);
}

const orgRef = organizationRefSchema;
const orgFields = organizationRefFieldsSchema;
const orgOptional = optionalOrganizationRefSchema;

export const mcpActionHandlers: Partial<Record<ActionName, HandlerDef>> = {
  "organization.list": {
    schema: z.object({}),
    run: async (_input, ctx) => {
      const caller = await createMcpStudioCaller({ userId: ctx.userId });
      return caller.organizations.list();
    },
  },
  "organization.view": {
    schema: orgRef,
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
      );
      if (!organizationId) throw new Error("organization_required");
      return mcpOrganizationView(ctx.userId, organizationId);
    },
  },
  "organization.hub.view": {
    schema: z.object({ organizationSlug: z.string().min(1) }),
    run: async (input, ctx) => {
      const caller = await createMcpStudioCaller({ userId: ctx.userId });
      const { organizationSlug } = input as { organizationSlug: string };
      return caller.organizations.getBySlug({ slug: organizationSlug });
    },
  },
  "organization.create": {
    schema: z.object({
      name: z.string().min(1),
      slug: z.string().min(1).optional(),
    }),
    run: async (input, ctx) => {
      const { name, slug } = input as { name: string; slug?: string };
      return mcpOrganizationCreate(ctx.userId, { name, slug });
    },
  },
  "organization.update": {
    schema: orgFields.extend({
      name: z.string().min(1).optional(),
      logo: safeHttpUrlSchema.nullable().optional(),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { name, logo } = input as { name?: string; logo?: string | null };
      return mcpOrganizationUpdate(ctx.userId, organizationId, { name, logo });
    },
  },
  "organization.delete": {
    schema: orgRef,
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      return mcpOrganizationDelete(ctx.userId, organizationId);
    },
  },
  "organization.restore": {
    schema: z.object({ organizationId: z.string().min(1) }),
    run: async (input, ctx) => {
      const { organizationId } = input as { organizationId: string };
      return mcpOrganizationRestore(ctx.userId, organizationId);
    },
  },
  "organization.transfer_ownership": {
    schema: orgFields.extend({ targetUserId: z.string().min(1) }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { targetUserId } = input as { targetUserId: string };
      return mcpOrganizationTransferOwnership(
        ctx.userId,
        organizationId,
        targetUserId,
      );
    },
  },
  "organization.settings.view": {
    schema: orgRef,
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => caller.organizations.getProfile(),
      ),
  },
  "organization.settings.update": {
    schema: orgFields.extend({
      name: z.string().min(1).optional(),
      logo: safeHttpUrlSchema.nullable().optional(),
      ...organizationProfileFieldsSchema.shape,
    }),
    run: async (input, ctx) => {
      const { name, logo, ...profile } = input as Record<string, unknown> & {
        name?: string;
        logo?: string | null;
        organizationId?: string;
        organizationSlug?: string;
      };
      const result = await withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        async (caller, organizationId) => {
          if (name !== undefined || logo !== undefined) {
            await mcpOrganizationUpdate(
              ctx.userId,
              organizationId,
              { name, logo },
              "organization.settings.update",
            );
          }
          const patch = Object.fromEntries(
            Object.entries(profile).filter(
              ([key]) => key !== "organizationId" && key !== "organizationSlug",
            ),
          );
          if (Object.keys(patch).length)
            await caller.organizations.updateProfile(patch as never);
          if (
            name === undefined &&
            logo === undefined &&
            !Object.keys(patch).length
          )
            throw new Error("organization_profile_patch_required");
          return { success: true };
        },
      );
      return result;
    },
  },
  "organization.archive": {
    schema: orgRef,
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => caller.organizations.archive(),
      ),
  },
  "organization.unarchive": {
    schema: orgRef,
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => caller.organizations.unarchive(),
      ),
  },
  "member.list": {
    schema: orgRef,
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      return mcpMembersList(ctx.userId, organizationId);
    },
  },
  "member.invite": {
    schema: orgFields.extend({
      email: z.string().email(),
      role: z.string().optional(),
      teamId: z.string().optional(),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { email, role, teamId } = input as {
        email: string;
        role?: string;
        teamId?: string;
      };
      return mcpMemberInvite(ctx.userId, organizationId, {
        email,
        role,
        teamId,
      });
    },
  },
  "member.remove": {
    schema: orgFields.extend({ userId: z.string().min(1) }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { userId: targetUserId } = input as { userId: string };
      return mcpMemberRemove(ctx.userId, organizationId, targetUserId);
    },
  },
  "member.suspend": {
    schema: orgFields.extend({
      memberId: z.string().min(1),
      suspended: z.boolean(),
      reason: z.string().trim().max(250).optional(),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
      );
      if (!organizationId) throw new Error("organization_required");
      const { memberId, suspended, reason } = input as {
        memberId: string;
        suspended: boolean;
        reason?: string;
      };
      return mcpMemberSetSuspended(
        ctx.userId,
        organizationId,
        memberId,
        suspended,
        reason,
      );
    },
  },
  "member.role.update": {
    schema: orgFields.extend({
      userId: z.string().min(1),
      role: z.string().min(1),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { userId: targetUserId, role } = input as {
        userId: string;
        role: string;
      };
      return mcpMemberUpdateRole(
        ctx.userId,
        organizationId,
        targetUserId,
        role,
      );
    },
  },
  "invitation.accept": {
    schema: z.object({ invitationId: z.string().min(1) }),
    run: async (input, ctx) => {
      const { invitationId } = input as { invitationId: string };
      return mcpInvitationAccept(ctx.userId, invitationId);
    },
  },
  "invitation.reject": {
    schema: z.object({ invitationId: z.string().min(1) }),
    run: async (input, ctx) => {
      const { invitationId } = input as { invitationId: string };
      return mcpInvitationReject(ctx.userId, invitationId);
    },
  },
  "invitation.cancel": {
    schema: orgFields.extend({ invitationId: z.string().min(1) }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { invitationId } = input as { invitationId: string };
      return mcpInvitationCancel(ctx.userId, organizationId, invitationId);
    },
  },
  "team.create": {
    schema: orgFields.extend({ name: z.string().min(1) }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { name } = input as { name: string };
      return mcpTeamCreate(ctx.userId, organizationId, name);
    },
  },
  "team.update": {
    schema: orgFields.extend({
      teamId: z.string().min(1),
      name: z.string().min(1),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { teamId, name } = input as { teamId: string; name: string };
      return mcpTeamUpdate(ctx.userId, organizationId, teamId, name);
    },
  },
  "team.delete": {
    schema: orgFields.extend({ teamId: z.string().min(1) }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { teamId } = input as { teamId: string };
      return mcpTeamDelete(ctx.userId, organizationId, teamId);
    },
  },
  "team.restore": {
    schema: orgFields.extend({ teamId: z.string().min(1) }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { teamId } = input as { teamId: string };
      return mcpTeamRestore(ctx.userId, organizationId, teamId);
    },
  },
  "team.member.add": {
    schema: orgFields.extend({
      teamId: z.string().min(1),
      userId: z.string().min(1),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { teamId, userId: targetUserId } = input as {
        teamId: string;
        userId: string;
      };
      return mcpTeamAddMember(ctx.userId, organizationId, teamId, targetUserId);
    },
  },
  "team.member.remove": {
    schema: orgFields.extend({
      teamId: z.string().min(1),
      userId: z.string().min(1),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { teamId, userId: targetUserId } = input as {
        teamId: string;
        userId: string;
      };
      return mcpTeamRemoveMember(
        ctx.userId,
        organizationId,
        teamId,
        targetUserId,
      );
    },
  },
  "project.create": {
    schema: orgFields.merge(createProjectInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.projects.create(input as z.infer<typeof createProjectInput>),
      ),
  },
  "project.read": {
    schema: orgOptional.extend({
      id: z.string().uuid().optional(),
      slug: z.string().min(1).optional(),
    }),
    run: async (input, ctx) => {
      const record = input as {
        organizationId?: string;
        organizationSlug?: string;
        id?: string;
        slug?: string;
      };
      return withOrgCaller(ctx.userId, record, async (caller) => {
        if (record.id) {
          return caller.projects.get({ id: record.id });
        }
        if (record.slug) {
          return caller.projects.getBySlug({ slug: record.slug });
        }
        return caller.projects.list();
      });
    },
  },
  "project.update": {
    schema: orgFields.merge(updateProjectInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.projects.update(input as z.infer<typeof updateProjectInput>),
      ),
  },
  "project.delete": {
    schema: orgFields.merge(getProjectInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.projects.delete(input as z.infer<typeof getProjectInput>),
      ),
  },
  "project.restore": {
    schema: orgFields.extend({ projectId: z.string().uuid() }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { projectId } = input as { projectId: string };
      return mcpProjectRestore(ctx.userId, organizationId, projectId);
    },
  },
  "project.archive": {
    schema: orgFields.merge(getProjectInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.projects.archive(input as z.infer<typeof getProjectInput>),
      ),
  },
  "project.unarchive": {
    schema: orgFields.merge(getProjectInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.projects.unarchive(input as z.infer<typeof getProjectInput>),
      ),
  },
  "project.status.change": {
    schema: orgFields.merge(changeProjectStatusInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.projects.changeStatus(
            input as z.infer<typeof changeProjectStatusInput>,
          ),
      ),
  },
  "project.public.toggle": {
    schema: orgFields.merge(toggleProjectPublicInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.projects.togglePublic(
            input as z.infer<typeof toggleProjectPublicInput>,
          ),
      ),
  },
  "project.assign_manager": {
    schema: orgFields.extend({
      projectId: z.string().uuid(),
      userId: z.string().min(1),
    }),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => {
          const { projectId, userId } = input as {
            projectId: string;
            userId: string;
          };
          return caller.projectAccess.assignManager({ projectId, userId });
        },
      ),
  },
  "project.assign_team": {
    schema: orgFields.extend({
      projectId: z.string().uuid(),
      teamId: z.string().min(1),
    }),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => {
          const { projectId, teamId } = input as {
            projectId: string;
            teamId: string;
          };
          return caller.projectAccess.assignTeam({ projectId, teamId });
        },
      ),
  },
  "project.permission.grant": {
    schema: orgFields.extend({
      projectId: z.string().uuid(),
      userId: z.string().min(1),
      grants: z.array(z.string()),
    }),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => {
          const { projectId, userId, grants } = input as {
            projectId: string;
            userId: string;
            grants: string[];
          };
          return caller.projectAccess.setMemberGrants({
            projectId,
            userId,
            grants,
          });
        },
      ),
  },
  "environment.create": {
    schema: orgFields.merge(createEnvironmentInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environments.create(
            input as z.infer<typeof createEnvironmentInput>,
          ),
      ),
  },
  "environment.read": {
    schema: orgOptional.extend({
      projectId: z.string().uuid().optional(),
      id: z.string().uuid().optional(),
    }),
    run: async (input, ctx) => {
      const record = input as {
        organizationId?: string;
        organizationSlug?: string;
        projectId?: string;
        id?: string;
      };
      return withOrgCaller(ctx.userId, record, async (caller) => {
        if (record.id) {
          return caller.environments.get({ id: record.id });
        }
        if (record.projectId) {
          return caller.environments.list({ projectId: record.projectId });
        }
        throw new Error("invalid_input: projectId or id required");
      });
    },
  },
  "environment.update": {
    schema: orgFields.merge(updateEnvironmentInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environments.update(
            input as z.infer<typeof updateEnvironmentInput>,
          ),
      ),
  },
  "environment.delete": {
    schema: orgFields.merge(getEnvironmentInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environments.delete(
            input as z.infer<typeof getEnvironmentInput>,
          ),
      ),
  },
  "environment.restore": {
    schema: orgFields.extend({
      projectId: z.string().uuid(),
      environmentId: z.string().uuid(),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { projectId, environmentId } = input as {
        projectId: string;
        environmentId: string;
      };
      return mcpEnvironmentRestore(
        ctx.userId,
        organizationId,
        projectId,
        environmentId,
      );
    },
  },
  "variable.create": {
    schema: orgFields.merge(createVariableInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environmentVariables.create(
            input as z.infer<typeof createVariableInput>,
          ),
      ),
  },
  "variable.read": {
    schema: orgFields.extend({
      environmentId: z.string().uuid().optional(),
      id: z.string().uuid().optional(),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const record = input as { environmentId?: string; id?: string };
      if (record.id) {
        return mcpVariableReadMetadata(ctx.userId, organizationId, record.id);
      }
      if (record.environmentId) {
        const caller = await createMcpStudioCaller({
          userId: ctx.userId,
          organizationId,
        });
        return caller.environmentVariables.list({
          environmentId: record.environmentId,
        });
      }
      throw new Error("invalid_input: environmentId or id required");
    },
  },
  "variable.update": {
    schema: orgFields.merge(updateVariableInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environmentVariables.update(
            input as z.infer<typeof updateVariableInput>,
          ),
      ),
  },
  "variable.delete": {
    schema: orgFields.extend({ id: z.string().uuid() }),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => {
          const { id } = input as { id: string };
          return caller.environmentVariables.delete({ id });
        },
      ),
  },
  "variable.restore": {
    schema: orgFields.extend({
      projectId: z.string().uuid(),
      variableId: z.string().uuid(),
    }),
    run: async (input, ctx) => {
      const organizationId = await resolveOrgFromInput(
        ctx.userId,
        input as {
          organizationId?: string;
          organizationSlug?: string;
        },
      );
      if (!organizationId) throw new Error("organization_required");
      const { projectId, variableId } = input as {
        projectId: string;
        variableId: string;
      };
      return mcpVariableRestore(
        ctx.userId,
        organizationId,
        projectId,
        variableId,
      );
    },
  },
  "variable.reveal": {
    schema: orgFields.merge(getVariableInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environmentVariables.get(
            input as z.infer<typeof getVariableInput>,
          ),
      ),
  },
  "variable.bulk_import": {
    schema: orgFields.merge(bulkImportVariablesInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environmentVariables.bulkImport(
            input as z.infer<typeof bulkImportVariablesInput>,
          ),
      ),
  },
  "variable.export": {
    schema: orgFields.merge(exportVariablesInput),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.environmentVariables.export(
            input as z.infer<typeof exportVariablesInput>,
          ),
      ),
  },
  "audit.timeline.view.org": {
    schema: orgFields.extend({
      projectId: z.string().optional(),
      action: z.string().optional(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
    }),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) =>
          caller.auditEvents.list({
            scope: "org",
            ...(input as Record<string, unknown>),
          }),
      ),
  },
  "audit.timeline.view.project": {
    schema: orgFields.extend({
      projectId: z.string().min(1),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
    }),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => {
          const record = input as {
            projectId: string;
            cursor?: string;
            limit?: number;
          };
          return caller.auditEvents.list({
            scope: "org",
            projectId: record.projectId,
            cursor: record.cursor,
            limit: record.limit,
          });
        },
      ),
  },
  "audit.timeline.view.user": {
    schema: orgFields.extend({
      targetUserId: z.string().min(1),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
    }),
    run: async (input, ctx) =>
      withOrgCaller(
        ctx.userId,
        input as { organizationId?: string; organizationSlug?: string },
        (caller) => {
          const record = input as {
            targetUserId: string;
            cursor?: string;
            limit?: number;
          };
          return caller.auditEvents.list({
            scope: "user",
            targetUserId: record.targetUserId,
            cursor: record.cursor,
            limit: record.limit,
          });
        },
      ),
  },
  "audit.timeline.view.self": {
    schema: orgOptional.extend({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
    }),
    run: async (input, ctx) => {
      const caller = await createMcpStudioCaller({ userId: ctx.userId });
      const record = input as { cursor?: string; limit?: number };
      return caller.auditEvents.list({
        scope: "self",
        cursor: record.cursor,
        limit: record.limit,
      });
    },
  },
  "notification.list": {
    schema: z.object({
      cursor: z
        .object({ createdAt: z.coerce.date(), id: z.string() })
        .optional(),
      limit: z.number().min(1).max(50).optional(),
      unreadOnly: z.boolean().optional(),
    }),
    run: async (input, ctx) => {
      const caller = await createMcpStudioCaller({ userId: ctx.userId });
      return caller.notifications.list(
        input as {
          cursor?: { createdAt: Date; id: string };
          limit?: number;
          unreadOnly?: boolean;
        },
      );
    },
  },
  "notification.mark_read": {
    schema: z.object({
      id: z.string().min(1).optional(),
      all: z.boolean().optional(),
    }),
    run: async (input, ctx) => {
      const caller = await createMcpStudioCaller({ userId: ctx.userId });
      const record = input as { id?: string; all?: boolean };
      if (record.all) {
        return caller.notifications.markAllRead();
      }
      if (record.id) {
        return caller.notifications.markRead({ id: record.id });
      }
      throw new Error("invalid_input: id or all=true required");
    },
  },
  "notification.mark_unread": {
    schema: z.object({ id: z.string().min(1) }),
    run: async (input, ctx) => {
      const caller = await createMcpStudioCaller({ userId: ctx.userId });
      return caller.notifications.markUnread(input as { id: string });
    },
  },
};

export async function executeMcpAction(
  action: ActionName,
  rawInput: unknown,
  ctx: McpToolContext,
): Promise<unknown> {
  const handler = mcpActionHandlers[action];
  if (!handler) {
    throw new Error(`unsupported_action: ${action}`);
  }
  const input = handler.schema.parse(rawInput ?? {});
  return handler.run(input, ctx);
}
