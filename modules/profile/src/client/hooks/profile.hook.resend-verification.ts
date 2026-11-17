"use client"

import { runAuthMutation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { useMutation } from "@packages/react-query"
import { clientEnv } from "@packages/t3-env/client"
import { useLocale } from "next-intl"

export function useResendVerificationEmail() {
  const locale = useLocale()
  const authApp = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")

  return useMutation({
    mutationFn: async (email: string) => {
      const callbackURL = `${authApp}/${locale}/verify-email`
      await runAuthMutation(
        () =>
          authClient.sendVerificationEmail({
            email,
            callbackURL,
          }),
        "Could not send verification email."
      )
    },
  })
}
