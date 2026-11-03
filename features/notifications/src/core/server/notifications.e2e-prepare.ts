import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { notification } from "@loftlancer/drizzle/schema/notifications";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/drizzle/schema/organization";
import { and, eq, inArray, sql } from "drizzle-orm";
import { notifyInvitationReceived } from "./notifications.invitations.trigger";

const E2E_PRIMARY_EMAIL = "e2e-playwright@loftlancer.local";
const E2E_INVITEE_EMAIL = "e2e-playwright-invitee@loftlancer.local";
const E2E_NOTIFICATIONS_ORG_SLUG = "e2e-notifications-org";

async function userIdForEmail(email: string) {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(sql`lower(${user.email})`, email.toLowerCase()))
    .limit(1);
  return row?.id ?? null;
}

export async function prepareE2eInvitationNotifications() {
  const inviterId = await userIdForEmail(E2E_PRIMARY_EMAIL);
  const inviteeId = await userIdForEmail(E2E_INVITEE_EMAIL);
  if (!inviterId || !inviteeId) {
    throw new Error(
      "E2E users must exist before prepare (run /api/e2e/login for each).",
    );
  }

  let orgId: string;
  const [existingOrg] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, E2E_NOTIFICATIONS_ORG_SLUG))
    .limit(1);

  if (existingOrg) {
    orgId = existingOrg.id;
  } else {
    orgId = crypto.randomUUID();
    await db.insert(organization).values({
      id: orgId,
      name: "E2E Notifications Org",
      slug: E2E_NOTIFICATIONS_ORG_SLUG,
    });
  }

  const [existingMember] = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.organizationId, orgId), eq(member.userId, inviterId)))
    .limit(1);

  if (!existingMember) {
    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: inviterId,
      role: "owner",
    });
  }

  await db
    .delete(notification)
    .where(
      and(
        inArray(notification.recipientUserId, [inviterId, inviteeId]),
        inArray(notification.type, [
          "invitation.received",
          "invitation.accepted",
        ]),
      ),
    );

  await db
    .delete(member)
    .where(and(eq(member.organizationId, orgId), eq(member.userId, inviteeId)));

  await db
    .delete(invitation)
    .where(
      eq(sql`lower(${invitation.email})`, E2E_INVITEE_EMAIL.toLowerCase()),
    );

  const invitationId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(invitation).values({
    id: invitationId,
    organizationId: orgId,
    email: E2E_INVITEE_EMAIL,
    role: "member",
    status: "pending",
    expiresAt,
    inviterId,
  });

  await notifyInvitationReceived(invitationId);

  return {
    invitationId,
    organizationId: orgId,
    inviteeEmail: E2E_INVITEE_EMAIL,
    inviterEmail: E2E_PRIMARY_EMAIL,
  };
}
