import type { defaultSupportedLocales } from "@features/i18n/constants"
import { escapeHtml } from "@features/i18n/server"

type AppLocale = (typeof defaultSupportedLocales)[number]

type InvitationEmailCopy = {
  readonly subject: string
  readonly html: string
  readonly text: string
}

function inviteCopy(
  locale: AppLocale,
  values: {
    readonly orgName: string
    readonly inviterName: string
    readonly inviteUrl: string
  }
): InvitationEmailCopy {
  const org = escapeHtml(values.orgName)
  const inviter = escapeHtml(values.inviterName)
  const url = escapeHtml(values.inviteUrl)

  if (locale === "es-es") {
    const subject = `Invitación a unirte a ${values.orgName}`
    const html = `<p><strong>${inviter}</strong> te ha invitado a unirte a <strong>${org}</strong> en Loftlancer.</p><p><a href="${url}">Revisar invitación</a></p>`
    const text = `${values.inviterName} te ha invitado a unirte a ${values.orgName} en Loftlancer.\n\nRevisar invitación: ${values.inviteUrl}`
    return { subject, html, text }
  }

  if (locale === "en-in") {
    const subject = `Invitation to join ${values.orgName}`
    const html = `<p><strong>${inviter}</strong> invited you to join <strong>${org}</strong> on Loftlancer.</p><p><a href="${url}">View invitation</a></p>`
    const text = `${values.inviterName} invited you to join ${values.orgName} on Loftlancer.\n\nView invitation: ${values.inviteUrl}`
    return { subject, html, text }
  }

  const subject = `Invitation to join ${values.orgName}`
  const html = `<p><strong>${inviter}</strong> invited you to join <strong>${org}</strong> on Loftlancer.</p><p><a href="${url}">View invitation</a></p>`
  const text = `${values.inviterName} invited you to join ${values.orgName} on Loftlancer.\n\nView invitation: ${values.inviteUrl}`
  return { subject, html, text }
}

export function buildOrgInvitationEmailContent(
  locale: AppLocale,
  values: {
    readonly orgName: string
    readonly inviterName: string
    readonly inviteUrl: string
  }
): InvitationEmailCopy {
  return inviteCopy(locale, values)
}
