import {
  activeInvitationWhere,
  activeUserWhere,
  db,
} from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { invitation } from "@loftlancer/drizzle/schema/organization";
import { and, eq, sql } from "drizzle-orm";
import {
  assertSyncInvitationAcceptedAllowed as assertSyncInvitationAcceptedAllowedWithDeps,
  assertSyncInvitationReceivedAllowed as assertSyncInvitationReceivedAllowedWithDeps,
  type InvitationSyncAuthDeps,
} from "./invitation-sync-auth-checks";
import { normalizeInviteEmail } from "./invitation-sync-input";

export type { InvitationSyncAuthDeps } from "./invitation-sync-auth-checks";
export {
  normalizeInviteEmail,
  organizationIdFromInviteSyncInput,
} from "./invitation-sync-input";

async function getUserEmailNormalized(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ email: user.email })
    .from(user)
    .where(activeUserWhere(eq(user.id, userId)))
    .limit(1);
  if (!row?.email) {
    return null;
  }
  return normalizeInviteEmail(row.email);
}

async function findPendingInviteAsInviter(args: {
  organizationId: string;
  inviterId: string;
  emailNormalized: string;
}): Promise<{ id: string } | undefined> {
  const [invite] = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.organizationId, args.organizationId),
          eq(invitation.inviterId, args.inviterId),
          eq(invitation.status, "pending"),
          eq(sql`lower(${invitation.email})`, args.emailNormalized),
        ),
      ),
    )
    .limit(1);
  return invite;
}

async function findAcceptedInviteForEmail(args: {
  organizationId: string;
  emailNormalized: string;
}): Promise<{ id: string } | undefined> {
  const [invite] = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.organizationId, args.organizationId),
          eq(invitation.status, "accepted"),
          eq(sql`lower(${invitation.email})`, args.emailNormalized),
        ),
      ),
    )
    .limit(1);
  return invite;
}

export const defaultInvitationSyncAuthDeps: InvitationSyncAuthDeps = {
  getUserEmailNormalized,
  findPendingInviteAsInviter,
  findAcceptedInviteForEmail,
};

export async function assertSyncInvitationReceivedAllowed(
  userId: string,
  organizationId: string,
  email: string,
  deps: InvitationSyncAuthDeps = defaultInvitationSyncAuthDeps,
): Promise<void> {
  return assertSyncInvitationReceivedAllowedWithDeps(
    userId,
    organizationId,
    email,
    deps,
  );
}

export async function assertSyncInvitationAcceptedAllowed(
  userId: string,
  organizationId: string,
  email: string,
  deps: InvitationSyncAuthDeps = defaultInvitationSyncAuthDeps,
): Promise<void> {
  return assertSyncInvitationAcceptedAllowedWithDeps(
    userId,
    organizationId,
    email,
    deps,
  );
}
