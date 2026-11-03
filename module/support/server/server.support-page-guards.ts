import {
  PageForbiddenError,
  PageNotFoundError,
} from "@features/authentication/core/server/authentication.page-guards-next/errors";
import { runWithPlatformAdminContext } from "@features/authorization/core/server/authorization.platform-admin-context";
import { requirePageAction } from "@features/authorization/core/server/page-guards/authorization.require-page-action";
import { sessionUserIsPlatformAdmin } from "@features/authorization/utils/authorization.platform-admin-flag";
import { activeSupportTicketWhere, db } from "@loftlancer/drizzle";
import { supportTicket } from "@loftlancer/drizzle/schema/support";
import { eq } from "drizzle-orm";
import {
  canReadTicket,
  type SupportAccessContext,
} from "../utils/utils.support-permissions";
import { userHasSupportManagerAccess } from "./server.support-manager.service";

async function loadSupportAccess(
  userId: string,
  user?: { role?: string | null } | null,
): Promise<SupportAccessContext> {
  return {
    userId,
    isSupportManager: await userHasSupportManagerAccess(userId, user),
  };
}

export async function requireSupportManagerPage(
  userId: string,
  user?: { role?: string | null } | null,
): Promise<void> {
  const platformAdmin = sessionUserIsPlatformAdmin(user);
  await runWithPlatformAdminContext(platformAdmin, async () => {
    const access = await loadSupportAccess(userId, user);
    if (!access.isSupportManager) {
      throw new PageForbiddenError("Support manager access required");
    }
    await requirePageAction("support.ticket.assign", { userId });
  });
}

export async function requireSupportTicketPage(
  userId: string,
  ticketId: string,
  user?: { role?: string | null } | null,
): Promise<void> {
  const platformAdmin = sessionUserIsPlatformAdmin(user);
  await runWithPlatformAdminContext(platformAdmin, async () => {
    await requirePageAction("support.ticket.read", { userId });

    const [row] = await db
      .select({
        requesterUserId: supportTicket.requesterUserId,
        status: supportTicket.status,
      })
      .from(supportTicket)
      .where(activeSupportTicketWhere(eq(supportTicket.id, ticketId)))
      .limit(1);

    if (!row) {
      throw new PageNotFoundError("Ticket not found");
    }

    const access = await loadSupportAccess(userId, user);
    if (!canReadTicket(access, row)) {
      throw new PageNotFoundError("Ticket not found");
    }
  });
}
