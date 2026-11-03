import { TRPCError } from "@trpc/server";
import { normalizeInviteEmail } from "./invitation-sync-input";

export type InvitationSyncAuthDeps = {
  getUserEmailNormalized: (userId: string) => Promise<string | null>;
  findPendingInviteAsInviter: (args: {
    organizationId: string;
    inviterId: string;
    emailNormalized: string;
  }) => Promise<{ id: string } | undefined>;
  findAcceptedInviteForEmail: (args: {
    organizationId: string;
    emailNormalized: string;
  }) => Promise<{ id: string } | undefined>;
};

export async function assertSyncInvitationReceivedAllowed(
  userId: string,
  organizationId: string,
  email: string,
  deps: InvitationSyncAuthDeps,
): Promise<void> {
  const normalized = normalizeInviteEmail(email);
  const invite = await deps.findPendingInviteAsInviter({
    organizationId,
    inviterId: userId,
    emailNormalized: normalized,
  });

  if (!invite) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
  }
}

export async function assertSyncInvitationAcceptedAllowed(
  userId: string,
  organizationId: string,
  email: string,
  deps: InvitationSyncAuthDeps,
): Promise<void> {
  const normalized = normalizeInviteEmail(email);
  const userEmail = await deps.getUserEmailNormalized(userId);
  if (!userEmail || userEmail !== normalized) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
  }

  const invite = await deps.findAcceptedInviteForEmail({
    organizationId,
    emailNormalized: normalized,
  });

  if (!invite) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
  }
}
