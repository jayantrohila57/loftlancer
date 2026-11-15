import { sendResendEmail } from "@packages/resend"

export interface MagicLinkEmailInput {
  readonly email: string
  readonly url: string
}

export async function sendMagicLinkEmail({
  email,
  url,
}: MagicLinkEmailInput): Promise<void> {
  await sendResendEmail({
    html: `<p><a href="${url}">Sign in to Loftlancer</a></p>`,
    subject: "Your sign-in link",
    to: email,
  })
}
