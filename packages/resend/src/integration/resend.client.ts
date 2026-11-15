import { serverEnv } from "@packages/t3-env/server"
import type { Resend } from "resend"

import { createResend } from "./resend.integration"

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined
  resendApiKey: string | undefined
}

export interface InitResendOptions {
  readonly apiKey: string
}

/** Creates the process-wide Resend client (idempotent per API key). */
export function initResend({ apiKey }: InitResendOptions): Resend {
  if (globalForResend.resend && globalForResend.resendApiKey === apiKey) {
    return globalForResend.resend
  }

  globalForResend.resend = createResend({ apiKey })
  globalForResend.resendApiKey = apiKey
  return globalForResend.resend
}

/** Returns the global client when `RESEND_API_KEY` is set; otherwise `undefined`. */
export function getResend(): Resend | undefined {
  const apiKey = serverEnv.RESEND_API_KEY
  if (!apiKey) {
    return undefined
  }

  if (globalForResend.resend && globalForResend.resendApiKey === apiKey) {
    return globalForResend.resend
  }

  return initResend({ apiKey })
}
