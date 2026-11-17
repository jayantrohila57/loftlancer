"use client"

import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import type { FormEvent } from "react"
import { useState } from "react"
import { readCheckEmailAddress } from "../../../../utils/auth.check-email-address"
import { useAuthLocale } from "../../../hooks/auth.locale.client"
import { api } from "./auth.api"
import { useAuthSignInPaths } from "./auth.sign-in-paths.client"

export interface AuthMagicLinkSignInState {
  readonly email: string
  readonly pending: boolean
  readonly setEmail: (email: string) => void
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export function useAuthMagicLinkSignIn(): AuthMagicLinkSignInState {
  const t = useTranslations("ui")
  const locale = useAuthLocale()
  const { callbackURL, checkEmailURL, errorCallbackURL, newUserCallbackURL } =
    useAuthSignInPaths()
  const magicLink = api.auth.useMagicLinkSignIn()
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = readCheckEmailAddress(email)
    if (!normalized) {
      toastManager.add({
        title: t("signInEmailInvalid"),
        type: "error",
      })
      return
    }
    setPending(true)
    try {
      await toastManager.promise(
        (async () => {
          await magicLink.mutateAsync({
            callbackURL,
            email: normalized,
            errorCallbackURL,
            locale,
            newUserCallbackURL,
          })
          window.location.assign(checkEmailURL(normalized))
        })(),
        {
          error: (error) =>
            error instanceof Error ? error.message : t("couldNotSendMagicLink"),
          loading: t("sendingMagicLink"),
          success: t("checkYourEmail"),
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
