import {
  notifyInvitationAccepted,
  notifyInvitationReceived,
} from "./notifications.invitations.trigger";

/** Dispatch registry `notifyOn` types after a successful audit_event. */
export async function notifyFromAuditEvent(input: {
  auditEventId: string;
  action: string;
  notifyTypes: string[];
  actorUserId: string;
  organizationId?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
}) {
  for (const type of input.notifyTypes) {
    const invitationId =
      input.entityId ??
      (typeof input.payload?.invitationId === "string"
        ? input.payload.invitationId
        : null);

    if (type === "invitation.received" && invitationId) {
      await notifyInvitationReceived(invitationId);
      continue;
    }
    if (type === "invitation.accepted" && invitationId) {
      await notifyInvitationAccepted(invitationId);
    }
  }
}
