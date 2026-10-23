import { OrgInviteEmail, sendEmail } from "@loftlancer/email";
import {
  defaultNotificationPreferences,
  notificationPreferencesSchema,
} from "@loftlancer/notifications/preferences";

async function maySendInvitationEmail(email: string) {
  if (process.env.NODE_ENV === "test" || !process.env.DATABASE_URL?.trim()) {
    return true;
  }

  try {
    const [{ activeUserWhere, db }, { user }, { eq, sql }] = await Promise.all([
      import("@loftlancer/db"),
      import("@loftlancer/db/schema/auth"),
      import("drizzle-orm"),
    ]);
    const [account] = await db
      .select({ notificationPreferences: user.notificationPreferences })
      .from(user)
      .where(
        activeUserWhere(
          eq(sql`lower(${user.email})`, email.trim().toLowerCase()),
        ),
      )
      .limit(1);
    if (!account) return true;

    const preferences = notificationPreferencesSchema.safeParse(
      account.notificationPreferences,
    );
    return (
      preferences.success ? preferences.data : defaultNotificationPreferences
    ).invitations.email;
  } catch {
    // Honor an opt-out if settings cannot be loaded; do not send by default.
    return false;
  }
}

export async function sendOrganizationInvitationEmail(input: {
  invitationId: string;
  email: string;
  role: string;
  organizationName: string;
  inviterName: string;
}) {
  if (!(await maySendInvitationEmail(input.email))) return;

  const studioUrl = (
    process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://loftlancer.com/studio"
  ).replace(/\/$/, "");
  const result = await sendEmail({
    to: input.email,
    subject: `${input.inviterName || "Someone"} invited you to ${input.organizationName} on Loftlancer`,
    react: OrgInviteEmail({
      organizationName: input.organizationName,
      inviterName: input.inviterName || input.email,
      role: input.role,
      acceptUrl: `${studioUrl}/invite/${encodeURIComponent(input.invitationId)}`,
    }),
    tags: [{ name: "type", value: "org-invite" }],
  });
  if (result.status === "skipped") {
    throw new Error(
      "Organization invitation email was not sent: email is not configured",
    );
  }
  if (result.status === "failed") {
    throw new Error("Organization invitation email could not be delivered");
  }
}
