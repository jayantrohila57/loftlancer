"use client"

import { useTheme } from "@features/theme"
import { authClient } from "@packages/better-auth/client"
import { useQuery } from "@packages/react-query"
import { clientEnv } from "@packages/t3-env/client"
import { useEffect } from "react"
import { appearancePreferencesResponseSchema } from "../../utils/validation/appearance-preferences.schema"
import {
  applyStoredAppearancePreferences,
  clearSignedOutAppearancePreferences,
} from "../apply-appearance-preferences"

/** Loads saved appearance preferences and applies them across apps for the signed-in user. */
export function AppearancePreferencesEffects() {
  const { setTheme } = useTheme()
  const { data: session } = authClient.useSession()
  const userId = session?.user.id

  const query = useQuery({
    queryKey: ["appearancePreferences", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await fetch(
        `${clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")}/api/account/appearance`,
        { credentials: "include", cache: "no-store" }
      )
      if (!response.ok) throw new Error("appearance-preferences")
      const result = appearancePreferencesResponseSchema.parse(
        await response.json()
      )
      if (result.status !== "success") throw new Error("appearance-preferences")
      return result.data
    },
  })

  useEffect(() => {
    if (!userId) {
      clearSignedOutAppearancePreferences()
      return
    }
    if (!query.data) return
    applyStoredAppearancePreferences(query.data, { setTheme })
  }, [userId, query.data, setTheme])

  return null
}

/** @deprecated Use {@link AppearancePreferencesEffects}. */
export const AuthAppearancePreferencesEffects = AppearancePreferencesEffects
