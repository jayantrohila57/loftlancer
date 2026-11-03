import type { ActionName } from "@features/authorization/utils";
import { TRPCError } from "@trpc/server";
import { t } from "../index";
import type { RequireActionContext } from "./require-action";
import { requireAction } from "./require-action";

type GuardCtx = {
  session: { user: { id: string } };
  activeOrganizationId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export function actionGuard(
  action: ActionName,
  resolve?: (
    input: unknown,
    ctx: GuardCtx,
  ) => Partial<RequireActionContext> | Promise<Partial<RequireActionContext>>,
  options?: { payload?: Record<string, unknown> },
) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    const input = "input" in opts ? opts.input : undefined;
    if (resolve && (input === undefined || input === null)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "actionGuard ran before procedure input was parsed — declare .input() before .use(actionGuard)",
      });
    }
    const guardCtx = ctx as GuardCtx;
    const partial = await Promise.resolve(resolve?.(input, guardCtx) ?? {});

    await requireAction(action, {
      userId: guardCtx.session.user.id,
      organizationId: guardCtx.activeOrganizationId ?? null,
      ipAddress: guardCtx.ipAddress ?? null,
      userAgent: guardCtx.userAgent ?? null,
      payload: options?.payload,
      ...partial,
      // Only mutations are audited; queries are read-only permission checks.
      audit: opts.type === "mutation",
    });

    return next();
  });
}
