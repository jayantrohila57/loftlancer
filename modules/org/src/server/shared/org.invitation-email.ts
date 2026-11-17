import { resolveEmailLocaleForEmail } from "@features/i18n/server"
import { getDb } from "@packages/drizzle"
import { user, userNotificationPreference } from "@packages/drizzle/schema"
import { sendResendEmail } from "@packages/resend"
import { serverEnv } from "@packages/t3-env/server"
import { eq, sql } from "drizzle-orm"

import { buildOrgInvitationEmailContent } from "./org.email-messages"
import { resolveInviterDisplayName } from "./org.invitation-preview"

type OrgInvitationEmailInput = {
  readonly id: string
  readonly email: string
  readonly organization: {
    readonly id: string
    readonly name: string
    readonly slug?: string | null
  }
  readonly invitation: {
    readonly inviterId: string
  }
}

function buildStudioInviteUrl(locale: string, invitationId: string) {
  const development = serverEnv.NODE_ENV !== "production"
  const studioBase = (
    serverEnv.STUDIO_APP_URL ??
    (development
      ? "http://localhost:3003"
      : new URL("/studio", serverEnv.BETTER_AUTH_URL).toString())
  ).replace(/\/$/, "")
  return `${studioBase}/${locale}/invite/${invitationId}`
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

  const locale = await resolveEmailLocaleForEmail({
    email: data.email,
    inviterUserId: data.invitation.inviterId,
  })
  const inviteUrl = buildStudioInviteUrl(locale, data.id)
  const orgName = data.organization.name.trim() || "your organization"
  const inviterName = await resolveInviterDisplayName(data.invitation.inviterId)
  const copy = buildOrgInvitationEmailContent(locale, {
    orgName,
    inviterName,
    inviteUrl,
  })

  await sendResendEmail({
    html: copy.html,
    text: copy.text,
    subject: copy.subject,
    to: data.email,
  })
}
