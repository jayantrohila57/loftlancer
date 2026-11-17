"use client"

import { toastManager } from "@packages/ui/components/toast"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { resolveAuthErrorMessageKey } from "../../../utils/auth.error-message"

export function AuthSignInOauthFeedback() {
  const t = useTranslations("ui")
  const searchParams = useSearchParams()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) return
    if (handled.current === error) return
    handled.current = error

    const messageKey = resolveAuthErrorMessageKey(error)
    toastManager.add({ title: t(messageKey), type: "error" })

    const url = new URL(window.location.href)
    url.searchParams.delete("error")
    url.searchParams.delete("error_description")
    window.history.replaceState(window.history.state, "", url.toString())
  }, [searchParams, t])

  return null
}
