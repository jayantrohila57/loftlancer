"use client"

import { I18nProvider } from "@features/i18n/provider"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery } from "@packages/react-query"
import { useLocale } from "next-intl"
import type { ReactNode } from "react"
import {
  buildAccountRegionalFormats,
  resolveAccountRegionalTimeZone,
} from "./auth.account-regional-formats"
import { useBrowserRegionalDefaults } from "./auth.browser-regional-defaults.client"

export function AuthAccountFormatProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const { data: session } = authClient.useSession()
  const locale = useLocale()
  const browserDefaults = useBrowserRegionalDefaults()
  const userId = session?.user.id
  const { data } = useQuery({
    queryKey: ["regionalPreferences", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await securityRpc.security.regionalPreferences.get()
      if (response.status !== "success")
        throw new Error("Preferences unavailable")
      return response.data
    },
  })
  return (
    <I18nProvider
      locale={locale}
      timeZone={resolveAccountRegionalTimeZone(data, browserDefaults?.timeZone)}
      formats={buildAccountRegionalFormats(data)}
    >
      {children}
    </I18nProvider>
  )
}
