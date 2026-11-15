"use client"

import { withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { serializeLinkedConnectedAccounts } from "../../utils/serialization/connected-accounts.serialize.linked-accounts"

export async function fetchConnectedAccounts() {
  return withClientRetry(async () => {
    const data = await securityRpc.security.signInMethods.accounts()
    return serializeLinkedConnectedAccounts(data)
  })
}
