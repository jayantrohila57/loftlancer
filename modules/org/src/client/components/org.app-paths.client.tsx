"use client"

import { clientEnv } from "@packages/t3-env/client"
import { useLocale } from "next-intl"
import type { ReactNode } from "react"
import { createContext, useContext, useMemo } from "react"

export type OrgAppPathOrg = {
  readonly slug?: string | null
}

export type OrgAppPaths = {
  readonly afterCreateUrl: (org?: OrgAppPathOrg) => string
  readonly createOrganizationUrl: string
  readonly organizationSettingsUrl: (org?: OrgAppPathOrg) => string
  readonly organizationsInvitationsUrl: string
  readonly organizationsListUrl: string
}

const OrgAppPathsContext = createContext<OrgAppPaths | null>(null)

function defaultOrgAppPaths(locale: string): OrgAppPaths {
  const base = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
  const accountOrg = `${base}/${locale}/account/organization`
  return {
    afterCreateUrl: () => accountOrg,
    createOrganizationUrl: `${base}/${locale}/organizations/create`,
    organizationSettingsUrl: () => accountOrg,
    organizationsInvitationsUrl: `${base}/${locale}/organizations/invitations`,
    organizationsListUrl: `${base}/${locale}/organizations/list`,
  }
}

export function OrgAppPathsProvider({
  children,
  value,
}: {
  readonly children: ReactNode
  readonly value: OrgAppPaths
}) {
  return (
    <OrgAppPathsContext.Provider value={value}>
      {children}
    </OrgAppPathsContext.Provider>
  )
}

export function useOrgAppPaths(): OrgAppPaths {
  const locale = useLocale()
  const override = useContext(OrgAppPathsContext)
  return useMemo(
    () => override ?? defaultOrgAppPaths(locale),
    [locale, override]
  )
}
