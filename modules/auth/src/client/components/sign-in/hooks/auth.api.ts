"use client"

import { authClient, signInWithSso } from "@packages/better-auth/client"
import { useMutation } from "@packages/react-query"
import { useTranslations } from "next-intl"
import { formatAuthClientError } from "../../../../utils/auth.client-error"

function useSocialSignIn() {
  const t = useTranslations("ui")
  return useMutation({
    mutationFn: async (input: {
      provider: "github" | "google"
      callbackURL: string
      newUserCallbackURL: string
      errorCallbackURL: string
      errorMessage: string
    }) => {
      const { error } = await authClient.signIn.social({
        provider: input.provider,
        callbackURL: input.callbackURL,
        newUserCallbackURL: input.newUserCallbackURL,
        errorCallbackURL: input.errorCallbackURL,
      })
      if (error)
        throw new Error(
          formatAuthClientError(error, input.errorMessage, {
            provider: input.provider,
            translate: (key, values) => t(key, values),
          })
        )
    },
  })
}
function useMagicLinkSignIn() {
  const t = useTranslations("ui")
  return useMutation({
    mutationFn: async (input: {
      email: string
      callbackURL: string
      newUserCallbackURL: string
      errorCallbackURL: string
      locale: string
    }) => {
      const { error } = await authClient.signIn.magicLink({
        callbackURL: input.callbackURL,
        email: input.email,
        errorCallbackURL: input.errorCallbackURL,
        metadata: { locale: input.locale },
        newUserCallbackURL: input.newUserCallbackURL,
      })
      if (error)
        throw new Error(
          formatAuthClientError(error, t("couldNotSendMagicLink"), {
            translate: (key, values) => t(key, values),
          })
        )
    },
  })
}

function useSsoSignIn() {
  const t = useTranslations("ui")
  return useMutation({
    mutationFn: async (input: {
      email: string
      callbackURL: string
      errorCallbackURL: string
    }) => {
      const { data, error } = await signInWithSso({
        email: input.email,
        callbackURL: input.callbackURL,
        errorCallbackURL: input.errorCallbackURL,
      })
      if (error) {
        throw new Error(
          formatAuthClientError(error, t("couldNotStartSso"), {
            translate: (key, values) => t(key, values),
          })
        )
      }
      if (typeof data?.url !== "string" || !data.url) {
        throw new Error(t("couldNotStartSso"))
      }
      window.location.assign(data.url)
    },
  })
}

export const api = {
  auth: { useSocialSignIn, useMagicLinkSignIn, useSsoSignIn },
}
