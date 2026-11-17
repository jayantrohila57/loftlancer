import { serverEnv } from "@packages/t3-env/server"

import { RESEND_DEFAULT_FROM } from "../constants/resend.constants"
import { getResend } from "./resend.client"

export interface SendResendEmailInput {
  readonly from?: string
  readonly html: string
  readonly subject: string
  readonly text?: string
  readonly to: string
}

export async function sendResendEmail({
  from = serverEnv.RESEND_FROM ?? RESEND_DEFAULT_FROM,
  html,
  subject,
  text,
  to,
}: SendResendEmailInput): Promise<void> {
  const resend = getResend()

  if (!resend) {
    if (serverEnv.NODE_ENV === "development") {
      console.info(`[resend] to=${to} subject=${subject}\n${html}`)
      return
    }

    throw new Error("RESEND_API_KEY is required to send email in production")
  }

  const { error } = await resend.emails.send({
    from,
    html,
    subject,
    text,
    to,
  })

  if (error) {
    throw new Error(error.message)
  }
}
