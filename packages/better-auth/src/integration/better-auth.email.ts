import { sendResendEmail } from "@packages/resend"

import { escapeHtmlAttribute, escapeHtmlText } from "./better-auth.email.escape"
import type { BetterAuthEmailLocale } from "./better-auth.email.locale"
import { resolveBetterAuthEmailLocale } from "./better-auth.email.locale"
import { getBetterAuthEmailMessages } from "./better-auth.email.messages"
import {
  buildBrandedEmailHtml,
  buildBrandedEmailPlainText,
} from "./better-auth.email-template"

export interface MagicLinkEmailInput {
  readonly email: string
  readonly url: string
  readonly locale?: string
  readonly request?: Request
}

function escapedUrlForEmail(url: string): string {
  return escapeHtmlAttribute(url)
}

function resolveMagicLinkLocale(input: {
  readonly locale?: string
  readonly request?: Request
}): BetterAuthEmailLocale {
  const normalized = input.locale?.trim().toLowerCase()
  if (
    normalized === "en-us" ||
    normalized === "en-in" ||
    normalized === "es-es"
  ) {
    return normalized
  }
  return resolveBetterAuthEmailLocale(input.request)
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
  locale,
  request,
}: MagicLinkEmailInput): Promise<void> {
  const resolvedLocale = resolveMagicLinkLocale({ locale, request })
  const copy = getBetterAuthEmailMessages(resolvedLocale)
  const safeUrl = escapedUrlForEmail(url)
  const branded = copy.magicLinkBranded
  const html = buildBrandedEmailHtml({ actionUrl: safeUrl, copy: branded })
  const text = buildBrandedEmailPlainText({ actionUrl: url, copy: branded })

  await deliverLocalizedEmail({
    to: email,
    subject: branded.subject,
    html,
    text,
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
