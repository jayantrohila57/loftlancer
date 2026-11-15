import { Resend } from "resend"

export interface CreateResendOptions {
  readonly apiKey: string
}

export function createResend({ apiKey }: CreateResendOptions): Resend {
  return new Resend(apiKey)
}
