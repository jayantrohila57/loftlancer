import type { ActionName } from "@loftlancer/actions";
import { z } from "zod/v3";
import { createMcpStudioCaller } from "./studio-caller";

export type McpToolContext = {
  userId: string;
  oauthClientId: string | null;
  toolName: string;
};

type HandlerDef = {
  schema: z.ZodTypeAny;
  run: (input: unknown, ctx: McpToolContext) => Promise<unknown>;
};

/**
 * Product reset: organization / teams / projects MCP tools removed.
 * Notifications (account-adjacent) remain.
 */
export const mcpActionHandlers: Partial<Record<ActionName, HandlerDef>> = {
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
