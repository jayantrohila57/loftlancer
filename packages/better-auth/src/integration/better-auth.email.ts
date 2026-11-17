import { sendResendEmail } from "@packages/resend"

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export interface MagicLinkEmailInput {
  readonly email: string
  readonly url: string
}

export async function sendMagicLinkEmail({
  email,
  url,
}: MagicLinkEmailInput): Promise<void> {
  await sendResendEmail({
    html: `<p><a href="${escapeHtmlAttribute(url)}">Sign in to Loftlancer</a></p>`,
    subject: "Your sign-in link",
    to: email,
  })
}
