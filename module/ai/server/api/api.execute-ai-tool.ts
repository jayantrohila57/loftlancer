import {
  type RequireActionContext,
  requireAction,
} from "@features/authorization/core/server/authorization.require-action";
import type { ActionName } from "@features/authorization/utils";

/**
 * Every future AI tool must run through this adapter. It prevents a model from
 * bypassing the same authorization and audit pipeline used by normal actions.
 */
export async function executeAiTool<T>(
  action: ActionName,
  context: RequireActionContext,
  execute: () => Promise<T>,
): Promise<T> {
  await requireAction(action, context);
  return execute();
}
