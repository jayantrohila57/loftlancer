"use client"

import { refreshAuthSession, runAuthMutation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { useMutation } from "@packages/react-query"
import { clientEnv } from "@packages/t3-env/client"
import { useLocale } from "next-intl"

import { profileChangeEmailInputSchema } from "../../utils/validation/profile.validation.email"

export function useChangeAccountEmail() {
  const locale = useLocale()
  const { refetch } = authClient.useSession()
  const authApp = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")

  return useMutation({
    mutationFn: async (newEmail: string) => {
      const parsed = profileChangeEmailInputSchema.safeParse({ newEmail })
      if (!parsed.success) {
        throw new Error("Could not change your email.")
      }
      const callbackURL = `${authApp}/${locale}/account/profile`
      await runAuthMutation(
        () =>
          authClient.changeEmail({
            newEmail: parsed.data.newEmail,
            callbackURL,
          }),
        "Could not change your email."
      )
    },
    onSuccess: async () => {
      await refreshAuthSession(refetch)
    },
  })
}
