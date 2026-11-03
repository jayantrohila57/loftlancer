import type { ActionName } from "@features/authorization/utils";
import {
  bulkImportVariablesInput,
  createEnvironmentInput,
  createVariableInput,
  exportVariablesInput,
  getEnvironmentInput,
  getVariableInput,
  updateEnvironmentInput,
  updateVariableInput,
} from "@modules/projects/utils/validation/utils.project-environment.validation";
import { z } from "zod/v3";
import {
  optionalOrganizationRefSchema,
  organizationRefFieldsSchema,
} from "./inputs";
import { resolveOrgFromInput } from "./organization-ops";
import { mcpEnvironmentRestore, mcpVariableRestore } from "./restore-ops";
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

const orgFields = organizationRefFieldsSchema;
const orgOptional = optionalOrganizationRefSchema;

export const mcpActionHandlers: Partial<Record<ActionName, HandlerDef>> = {
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
