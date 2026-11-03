import {
  PageForbiddenError,
  PageNotFoundError,
} from "@features/authentication/core/server/authentication.page-guard-errors";
import type { ActionName } from "@features/authorization/utils";
import { TRPCError } from "@trpc/server";
import {
  type RequireActionContext,
  requireAction,
} from "../authorization.require-action";

export async function requirePageAction(
  action: ActionName,
  ctx: RequireActionContext,
): Promise<void> {
  try {
    await requireAction(action, { ...ctx, audit: false });
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === "FORBIDDEN") {
        throw new PageForbiddenError(error.message);
      }
      if (error.code === "NOT_FOUND") {
        throw new PageNotFoundError(error.message);
      }
    }
    throw error;
  }
}
