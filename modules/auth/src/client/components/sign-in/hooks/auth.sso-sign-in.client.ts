"use client"

import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import type { FormEvent } from "react"
import { useState } from "react"

import { api } from "./auth.api"
import { useAuthSignInPaths } from "./auth.sign-in-paths.client"

export interface AuthSsoSignInState {
  readonly email: string
  readonly pending: boolean
  readonly setEmail: (email: string) => void
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export function useAuthSsoSignIn(): AuthSsoSignInState {
  const t = useTranslations("ui")
  const { callbackURL, errorCallbackURL } = useAuthSignInPaths()
  const ssoSignIn = api.auth.useSsoSignIn()
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    try {
      await toastManager.promise(
        ssoSignIn.mutateAsync({
          callbackURL,
          email: email.trim(),
          errorCallbackURL,
        }),
        {
          error: t("couldNotStartSso"),
          loading: t("redirectingToSso"),
          success: t("redirectingToSso"),
        }
      )
    } catch {
      // Toast already surfaced the failure.
    } finally {
      setPending(false)
    }
  }

  return {
    email,
    onSubmit,
    pending,
    setEmail,
  }
}
