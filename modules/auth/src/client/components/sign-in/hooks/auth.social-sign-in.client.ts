"use client"

import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"

import { formatAuthClientError } from "../../../../utils/auth.client-error"
import { api } from "./auth.api"
import { useAuthSignInPaths } from "./auth.sign-in-paths.client"

type AuthSocialProvider = "github" | "google"

export type AuthSocialSignInOptions = {
  readonly configured?: boolean
}

export interface AuthSocialSignInState {
  readonly pending: boolean
  readonly signIn: () => Promise<void>
}

export function useAuthSocialSignIn(
  provider: AuthSocialProvider,
  options?: AuthSocialSignInOptions
): AuthSocialSignInState {
  const configured = options?.configured ?? true
  const t = useTranslations("ui")
  const { callbackURL, newUserCallbackURL, errorCallbackURL } =
    useAuthSignInPaths()
  const { mutateAsync: signInSocial } = api.auth.useSocialSignIn()
  const [pending, setPending] = useState(false)
  const providerName = provider === "github" ? "GitHub" : "Google"
  const copy = {
    error: t("socialSignInFailed", { provider: providerName }),
    loading: t("socialConnecting", { provider: providerName }),
    success: t("socialRedirecting", { provider: providerName }),
  }

  const signIn = useCallback(async () => {
    if (!configured) {
      toastManager.add({
        title: formatAuthClientError(
          { code: "PROVIDER_NOT_FOUND" },
          copy.error,
          { provider }
        ),
        type: "error",
      })
      return
    }
    setPending(true)
    try {
      await toastManager.promise(
        (async () => {
          await signInSocial({
            callbackURL,
            newUserCallbackURL,
            errorCallbackURL,
            provider,
            errorMessage: copy.error,
          })
        })(),
        {
          error: (error) =>
            error instanceof Error ? error.message : copy.error,
          loading: copy.loading,
          success: copy.success,
        }
      )
    } catch {
      // Toast already surfaced the failure; avoid Next.js dev runtime overlay.
    } finally {
      setPending(false)
    }
  }, [
    callbackURL,
    newUserCallbackURL,
    configured,
    errorCallbackURL,
    copy.error,
    copy.loading,
    copy.success,
    provider,
    signInSocial,
  ])

  return { pending, signIn }
}
