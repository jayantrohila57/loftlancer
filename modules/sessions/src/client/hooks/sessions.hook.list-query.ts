"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import type { SessionsOutput } from "../../utils/types/sessions.types.sessions"

export async function fetchSessionsList(): Promise<SessionsOutput> {
  return withClientRetry(async () => {
    const response = await securityRpc.security.sessions.list()
    if (response.status === "error") {
      const code = response.error?.code
      if (code === "SESSIONS_UNAVAILABLE") {
        throw new TransientClientError(
          response.message,
          response.error ?? { code }
        )
      }
      throw new Error(response.message)
    }
    return response
  })
}
