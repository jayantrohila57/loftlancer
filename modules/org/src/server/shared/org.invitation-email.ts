import { getDb } from "@packages/drizzle"
import { user, userNotificationPreference } from "@packages/drizzle/schema"
import { sendResendEmail } from "@packages/resend"
import { serverEnv } from "@packages/t3-env/server"
import { eq, sql } from "drizzle-orm"

type OrgInvitationEmailInput = {
  readonly email: string
  readonly organization: {
    readonly name: string
  }
}

function buildReceivedInvitationsUrl() {
  const development = serverEnv.NODE_ENV !== "production"
  const studioBase = (
    serverEnv.STUDIO_APP_URL ??
    (development
      ? "http://localhost:3003"
      : new URL("/studio", serverEnv.BETTER_AUTH_URL).toString())
  ).replace(/\/$/, "")
  return `${studioBase}/en-us/organizations/invitations`
}

export async function sendOrgInvitationEmail(
  data: OrgInvitationEmailInput
): Promise<void> {
  const db = getDb()
  if (!db) throw new Error("Database unavailable for notification preferences")

  const [recipient] = await db
    .select({ enabled: userNotificationPreference.organizationInvitesEnabled })
    .from(user)
    .leftJoin(
      userNotificationPreference,
      eq(userNotificationPreference.userId, user.id)
    )
    .where(sql`lower(${user.email}) = lower(${data.email})`)
    .limit(1)

  if (recipient?.enabled === false) return

  const inviteUrl = buildReceivedInvitationsUrl()
  const orgName = data.organization.name.trim() || "your organization"
  const escapedOrgName = orgName.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      default:
        return "&#39;"
    }
  })

  await sendResendEmail({
    html: `<p>You have been invited to join <strong>${escapedOrgName}</strong> on Loftlancer.</p><p><a href="${inviteUrl}">View your invitations</a> to accept or decline.</p>`,
    subject: `Invitation to join ${orgName}`,
    to: data.email,
  })
}
