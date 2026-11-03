import { runWithPlatformAdminContext } from "@features/authorization/core/server/authorization.platform-admin-context";
import {
  isPostgresMissingColumnError,
  logSchemaOutOfDateOnce,
} from "@loftlancer/drizzle/postgres-errors";
import { logger } from "@loftlancer/sentry";
import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import {
  getActiveOrganizationId,
  requireActiveOrganization,
} from "@modules/organizations/server/service/server.org-access.service";
import { initTRPC, TRPCError } from "@trpc/server";
import { sessionUserIsPlatformAdmin } from "./actions/platform-admin-flag";
import { assertConsoleOperator } from "./console-access";
import { runWithConsoleAuditContext } from "./console-audit-context";
import type { Context } from "./core/orpc.context";
import { getFriendlyErrorMessage } from "./utils/orpc.errors";
import { transformer } from "./utils/orpc.transformer";

export const t = initTRPC.context<Context>().create({
  transformer,
  errorFormatter({ shape, error }) {
    const fallback = shape.message || "Something went wrong. Please try again.";
    const fromCause = getFriendlyErrorMessage(error.cause ?? error, fallback);
    const fromShape = getFriendlyErrorMessage(
      shape.message ? new Error(shape.message) : null,
      fromCause,
    );
    const root = error.cause ?? error;
    if (isPostgresMissingColumnError(root)) {
      logSchemaOutOfDateOnce(root, "tRPC errorFormatter");
    } else if (fromShape !== shape.message) {
      logger.error("tRPC error sanitized for client", error.cause ?? error, {
        "trpc.code": shape.data?.code ?? String(shape.code),
        clientMessage: fromShape,
      });
    }
    return {
      ...shape,
      message: fromShape,
    };
  },
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  const session = ctx.session;
  const platformAdmin = sessionUserIsPlatformAdmin(
    session.user as { role?: string | null },
  );
  return runWithPlatformAdminContext(platformAdmin, () =>
    next({
      ctx: {
        session,
        platformAdmin,
      },
    }),
  );
});

/** Platform console operator — Admin role + `CONSOLE_ALLOWED_EMAILS` (Decision 11). */
export const consoleProcedure = protectedProcedure.use(({ ctx, next }) => {
  assertConsoleOperator(ctx.session);
  return runWithConsoleAuditContext(() => next({ ctx }));
});

/** When orgs are enabled, requires an active organization on the session. */
export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isOrganizationsEnabled()) {
    return next({
      ctx: {
        ...ctx,
        activeOrganizationId: null as string | null,
      },
    });
  }

  const activeOrganizationId = await requireActiveOrganization(ctx.session);
  return next({
    ctx: {
      ...ctx,
      activeOrganizationId,
    },
  });
});

/** Exposes active org id when set; does not require org membership. */
export const orgAwareProcedure = protectedProcedure.use(({ ctx, next }) => {
  const activeOrganizationId = isOrganizationsEnabled()
    ? getActiveOrganizationId(ctx.session)
    : null;
  return next({
    ctx: {
      ...ctx,
      activeOrganizationId,
    },
  });
});
