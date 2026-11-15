"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import type { z } from "zod"
import type { signInMethodInventoryOutputSchema } from "../../utils/validation/connected-accounts.sign-in-methods.inventory.schema"

type SignInMethodInventoryOutput = z.infer<
  typeof signInMethodInventoryOutputSchema
>

export async function fetchSignInMethodInventory(): Promise<SignInMethodInventoryOutput> {
  return withClientRetry(async () => {
    const response = await securityRpc.security.signInMethods.inventory()
    if (response.status === "error") {
      const code = response.error?.code
      if (code === "SIGN_IN_METHODS_UNAVAILABLE") {
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
