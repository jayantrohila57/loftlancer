"use client"

import { toastManager } from "@packages/ui/components/toast"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import {
  authOAuthCallbackMessageKey,
  classifyAuthOAuthCallbackError,
} from "../../../utils/auth.oauth-callback-error"

export function AuthSignInOauthFeedback() {
  const t = useTranslations("ui")
  const searchParams = useSearchParams()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) return
    if (handled.current === error) return
    handled.current = error

    const kind = classifyAuthOAuthCallbackError(error)
    const messageKey = authOAuthCallbackMessageKey[kind]
    toastManager.add({ title: t(messageKey), type: "error" })

    const url = new URL(window.location.href)
    url.searchParams.delete("error")
    url.searchParams.delete("error_description")
    window.history.replaceState(window.history.state, "", url.toString())
  }, [searchParams, t])

  return null
}
