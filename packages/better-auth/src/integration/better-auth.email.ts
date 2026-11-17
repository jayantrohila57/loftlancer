import { sendResendEmail } from "@packages/resend"

import { resolveMagicLinkEmailCopy } from "./better-auth.email-copy"
import {
  buildBrandedEmailHtml,
  buildBrandedEmailPlainText,
  escapeHtmlAttribute,
} from "./better-auth.email-template"

export interface MagicLinkEmailInput {
  readonly email: string
  readonly url: string
  readonly locale?: string
}

export async function sendMagicLinkEmail({
  email,
  url,
  locale,
}: MagicLinkEmailInput): Promise<void> {
  const copy = resolveMagicLinkEmailCopy(locale)
  const safeUrl = escapeHtmlAttribute(url)
  const html = buildBrandedEmailHtml({ actionUrl: safeUrl, copy })
  const text = buildBrandedEmailPlainText({ actionUrl: url, copy })

  await sendResendEmail({
    html,
    subject: copy.subject,
    text,
    to: email,
  })
}
