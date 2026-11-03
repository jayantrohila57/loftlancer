/** Product reset: organization invitation preview helpers removed. */

export type PublicInvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "canceled"
  | "expired"
  | "unknown";

export function getPublicInvitationStatus(_input: {
  status?: string | null;
  expiresAt?: Date | string | null;
}): PublicInvitationStatus {
  return "unknown";
}
