import {
  type ActionName,
  isActionsAuditEnabled,
} from "@features/authorization/utils";
import { TRPCError } from "@trpc/server";

type RequireUserActionDeps = {
  isActionsAuditEnabled: () => boolean;
  requireAction: (action: ActionName, ctx: { userId: string }) => Promise<void>;
  isActionBlocked: (
    action: ActionName,
    scope: { userId: string },
  ) => Promise<boolean>;
};

async function loadDefaultDeps(): Promise<RequireUserActionDeps> {
  const [{ isActionBlocked }, { requireAction }] = await Promise.all([
    import(
      "@features/authorization/core/server/authorization.is-action-blocked"
    ),
    import("./require-action"),
  ]);
  return {
    isActionsAuditEnabled,
    requireAction,
    isActionBlocked,
  };
}

/**
 * Enforces user-scoped actions when the audit timeline is off (block list only),
 * or full requireAction when audit is enabled.
 */
export async function requireUserAction(
  action: ActionName,
  userId: string,
  deps?: RequireUserActionDeps,
): Promise<void> {
  const resolved = deps ?? (await loadDefaultDeps());

  if (resolved.isActionsAuditEnabled()) {
    await resolved.requireAction(action, { userId });
    return;
  }

  if (await resolved.isActionBlocked(action, { userId })) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Action blocked" });
  }
}
