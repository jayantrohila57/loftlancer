"use client"

import { toastManager } from "@packages/ui/components/toast"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { readCheckEmailAddress } from "../../../../utils/auth.check-email-address"
import { api } from "../../sign-in/hooks/auth.api"
import { useAuthSignInPaths } from "../../sign-in/hooks/auth.sign-in-paths.client"

export interface AuthCheckEmailState {
  readonly email: string
  readonly canResend: boolean
  readonly pending: boolean
  readonly signInURL: string
  readonly onResend: () => Promise<void>
}

export function useAuthCheckEmail(): AuthCheckEmailState {
  const t = useTranslations("ui")
  const searchParams = useSearchParams()
  const email = readCheckEmailAddress(searchParams.get("email")) ?? ""
  const { callbackURL, errorCallbackURL, newUserCallbackURL, signInURL } =
    useAuthSignInPaths()
  const magicLink = api.auth.useMagicLinkSignIn()
  const [pending, setPending] = useState(false)
  const canResend = email.length > 0

  async function onResend() {
    if (!canResend || pending) {
      return
    }
    setPending(true)
    try {
      await toastManager.promise(
        magicLink.mutateAsync({
          callbackURL,
          email,
          errorCallbackURL,
          newUserCallbackURL,
        }),
        {
          error: (error) =>
            error instanceof Error ? error.message : t("couldNotSendMagicLink"),
          loading: t("sendingMagicLink"),
          success: t("magicLinkResent"),
        }
      )
    } catch {
      // Toast already surfaced the failure.
    } finally {
      setPending(false)
    }
  }

  return {
    canResend,
    email,
    onResend,
    pending,
    signInURL,
  }
}
