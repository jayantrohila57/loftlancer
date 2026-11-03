import { linkPendingNotificationsForUser } from "@features/notifications/core/server/notifications.notify";
import { setBetterAuthProductHooks } from "@loftlancer/better-auth/product-hooks-host";
import { writeAuthAuditEvent } from "./authentication.auth-audit-event";
import { sendOrganizationInvitationEmail } from "./authentication.organization-invitation-email";
import { cleanupOrganizationMemberAccess } from "./authentication.organization-member-access-cleanup";

let registered = false;

/** Wires product callbacks into `@loftlancer/better-auth` SDK hooks. */
export function registerBetterAuthProductHooks(): void {
  if (registered) return;
  registered = true;
  setBetterAuthProductHooks({
    writeAuthAuditEvent,
    sendOrganizationInvitationEmail,
    cleanupOrganizationMemberAccess,
    linkPendingNotificationsForUser,
  });
}

registerBetterAuthProductHooks();
