"use client"

import { authClient, signInWithSso } from "@packages/better-auth/client"
import { useMutation } from "@packages/react-query"
import { formatAuthClientError } from "../../../../utils/auth.client-error"

function useSocialSignIn() {
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
          })
        )
    },
  })
}
function useMagicLinkSignIn() {
  return useMutation({
    mutationFn: async (input: {
      email: string
      callbackURL: string
      newUserCallbackURL: string
      errorCallbackURL: string
    }) => {
      const { error } = await authClient.signIn.magicLink(input)
      if (error)
        throw new Error(
          formatAuthClientError(error, "Could not send magic link")
        )
    },
  })
}

function useSsoSignIn() {
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
        throw new Error(formatAuthClientError(error, "Could not start SSO"))
      }
      if (typeof data?.url !== "string" || !data.url) {
        throw new Error("Could not start SSO")
      }
      window.location.assign(data.url)
    },
  })
}

export const api = {
  auth: { useSocialSignIn, useMagicLinkSignIn, useSsoSignIn },
}
