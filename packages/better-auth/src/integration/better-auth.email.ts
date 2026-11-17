import { sendResendEmail } from "@packages/resend"

import { escapeHtmlAttribute, escapeHtmlText } from "./better-auth.email.escape"
import { resolveBetterAuthEmailLocale } from "./better-auth.email.locale"
import { getBetterAuthEmailMessages } from "./better-auth.email.messages"

export interface MagicLinkEmailInput {
  readonly email: string
  readonly url: string
  readonly request?: Request
}

function escapedUrlForEmail(url: string): string {
  return escapeHtmlAttribute(url)
}

async function deliverLocalizedEmail(input: {
  readonly to: string
  readonly subject: string
  readonly html: string
  readonly text: string
}) {
  await sendResendEmail({
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: input.to,
  })
}

export async function sendMagicLinkEmail({
  email,
  url,
  request,
}: MagicLinkEmailInput): Promise<void> {
  const locale = resolveBetterAuthEmailLocale(request)
  const copy = getBetterAuthEmailMessages(locale)
  const safeUrl = escapedUrlForEmail(url)
  await deliverLocalizedEmail({
    to: email,
    subject: copy.magicLinkSubject,
    html: copy.magicLinkHtml(safeUrl),
    text: copy.magicLinkText(url),
  })
}

export async function sendVerificationEmailDelivery(input: {
  readonly email: string
  readonly url: string
  readonly request?: Request
}): Promise<void> {
  const locale = resolveBetterAuthEmailLocale(input.request)
  const copy = getBetterAuthEmailMessages(locale)
  const safeUrl = escapedUrlForEmail(input.url)
  await deliverLocalizedEmail({
    to: input.email,
    subject: copy.verifyEmailSubject,
    html: copy.verifyEmailHtml(safeUrl),
    text: copy.verifyEmailText(input.url),
  })
}

export async function sendChangeEmailConfirmationDelivery(input: {
  readonly email: string
  readonly newEmail: string
  readonly url: string
  readonly request?: Request
}): Promise<void> {
  const locale = resolveBetterAuthEmailLocale(input.request)
  const copy = getBetterAuthEmailMessages(locale)
  const safeUrl = escapedUrlForEmail(input.url)
  const safeNewEmail = escapeHtmlText(input.newEmail)
  await deliverLocalizedEmail({
    to: input.email,
    subject: copy.changeEmailConfirmSubject,
    html: copy.changeEmailConfirmHtml({
      newEmail: safeNewEmail,
      url: safeUrl,
    }),
    text: copy.changeEmailConfirmText({
      newEmail: input.newEmail,
      url: input.url,
    }),
  })
}
