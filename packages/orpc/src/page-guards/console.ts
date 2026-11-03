import { PageForbiddenError } from "@features/authentication/core/server/authentication.page-guards-next/errors";
import { runWithPlatformAdminContext } from "@features/authorization/core/server/authorization.platform-admin-context";
import { requirePageAction } from "@features/authorization/core/server/page-guards/authorization.require-page-action";
import { sessionUserIsPlatformAdmin } from "@features/authorization/utils/authorization.platform-admin-flag";
import type { AuthSession } from "@loftlancer/better-auth/session-types";
import { TRPCError } from "@trpc/server";
import { assertConsoleOperator } from "../console-access";

export async function requireConsoleOperatorPage(
  session: AuthSession,
): Promise<void> {
  try {
    assertConsoleOperator(session, { surface: "page" });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      throw new PageForbiddenError(error.message);
    }
    throw error;
  }

  const platformAdmin = sessionUserIsPlatformAdmin(
    session.user as { role?: string | null },
  );

  await runWithPlatformAdminContext(platformAdmin, async () => {
    await requirePageAction("platform.user.list", {
      userId: session.user.id,
    });
  });
}
