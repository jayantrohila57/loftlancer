export type PublicInvitationStatus =
  | "pending"
  | "expired"
  | "accepted"
  | "declined"
  | "revoked"
  | "unavailable"
  | "not_found";

type InvitationPreviewRecord = {
  status: string;
  expiresAt: Date;
  deletedAt: Date | null;
  organizationDeletedAt: Date | null;
};

export function getPublicInvitationStatus(
  invite: InvitationPreviewRecord | undefined,
  now = new Date(),
): PublicInvitationStatus {
  if (!invite) return "not_found";
  if (invite.organizationDeletedAt) return "unavailable";
  if (invite.deletedAt || invite.status === "canceled") return "revoked";
  if (invite.status === "accepted") return "accepted";
  if (invite.status === "rejected") return "declined";
  if (invite.status !== "pending") return "not_found";
  return invite.expiresAt <= now ? "expired" : "pending";
}
