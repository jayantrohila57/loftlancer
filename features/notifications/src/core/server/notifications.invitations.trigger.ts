import {
  activeInvitationWhere,
  activeMemberWhere,
  activeUserWhere,
  db,
} from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/drizzle/schema/organization";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { isNotificationsEnabled } from "../../config/notifications.feature.config";
import { normalizeNotificationEmail } from "../../utils/notifications.email.utils";
import { notify } from "./notifications.notify";

async function findUserIdByEmail(email: string) {
  const normalized = normalizeNotificationEmail(email);
  const row = await db
    .select({ id: user.id })
    .from(user)
    .where(activeUserWhere(eq(sql`lower(${user.email})`, normalized)))
    .limit(1);
  return row[0]?.id ?? null;
}

export async function notifyInvitationReceived(invitationId: string) {
  if (!isNotificationsEnabled()) {
    return;
  }

  const rows = await db
    .select({
      invitationId: invitation.id,
      email: invitation.email,
      organizationId: invitation.organizationId,
      organizationName: organization.name,
      inviterId: invitation.inviterId,
      inviterName: user.name,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .innerJoin(user, eq(invitation.inviterId, user.id))
    .where(activeInvitationWhere(eq(invitation.id, invitationId)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return;
  }

  const recipientUserId = await findUserIdByEmail(row.email);
  await notify({
    type: "invitation.received",
    recipients: recipientUserId
      ? [{ userId: recipientUserId }]
      : [{ email: row.email }],
    actorUserId: row.inviterId,
    organizationId: row.organizationId,
    entity: { type: "invitation", id: row.invitationId },
    idempotencyKey: `invitation.received:${row.invitationId}`,
    actorName: row.inviterName,
    data: {
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      invitationId: row.invitationId,
      inviterName: row.inviterName,
    },
  });
}

export async function notifyInvitationAccepted(invitationId: string) {
  if (!isNotificationsEnabled()) {
    return;
  }

  const rows = await db
    .select({
      invitationId: invitation.id,
      email: invitation.email,
      organizationId: invitation.organizationId,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      inviterId: invitation.inviterId,
      status: invitation.status,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(activeInvitationWhere(eq(invitation.id, invitationId)))
    .limit(1);

  const invite = rows[0];
  if (invite?.status !== "accepted") {
    return;
  }

  const memberUser = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(
      activeUserWhere(
        eq(sql`lower(${user.email})`, invite.email.trim().toLowerCase()),
      ),
    )
    .limit(1);

  const memberRow = memberUser[0];
  if (!memberRow) {
    return;
  }

  const adminRows = await db
    .select({ userId: member.userId })
    .from(member)
    .where(
      activeMemberWhere(
        and(
          eq(member.organizationId, invite.organizationId),
          inArray(member.role, ["owner", "admin"]),
        ),
      ),
    );

  const recipientIds = new Set<string>([invite.inviterId]);
  for (const admin of adminRows) {
    recipientIds.add(admin.userId);
  }
  recipientIds.delete(memberRow.id);

  await notify({
    type: "invitation.accepted",
    recipients: [...recipientIds].map((userId) => ({ userId })),
    actorUserId: memberRow.id,
    organizationId: invite.organizationId,
    entity: { type: "invitation", id: invite.invitationId },
    idempotencyKey: `invitation.accepted:${invite.invitationId}`,
    actorName: memberRow.name,
    data: {
      organizationId: invite.organizationId,
      organizationName: invite.organizationName,
      organizationSlug: invite.organizationSlug,
      invitationId: invite.invitationId,
      memberName: memberRow.name,
      memberUserId: memberRow.id,
    },
  });
}

export async function syncInvitationReceivedByEmail(
  organizationId: string,
  email: string,
  inviterUserId: string,
) {
  if (!isNotificationsEnabled()) {
    return;
  }

  const normalized = normalizeNotificationEmail(email);
  const rows = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.inviterId, inviterUserId),
          eq(invitation.status, "pending"),
          eq(sql`lower(${invitation.email})`, normalized),
        ),
      ),
    )
    .orderBy(desc(invitation.createdAt))
    .limit(1);

  const invite = rows[0];
  if (invite) {
    await notifyInvitationReceived(invite.id);
  }
}

export async function syncInvitationAcceptedByEmail(
  organizationId: string,
  email: string,
) {
  if (!isNotificationsEnabled()) {
    return;
  }

  const normalized = normalizeNotificationEmail(email);
  const rows = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.status, "accepted"),
          or(
            eq(sql`lower(${invitation.email})`, normalized),
            eq(invitation.email, email.trim()),
          ),
        ),
      ),
    )
    .orderBy(desc(invitation.createdAt))
    .limit(1);

  const invite = rows[0];
  if (invite) {
    await notifyInvitationAccepted(invite.id);
  }
}
