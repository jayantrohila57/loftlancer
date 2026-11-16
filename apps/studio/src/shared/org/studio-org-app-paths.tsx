"use client"

import type { OrgAppPaths } from "@modules/org/account-screens"
import { OrgAppPathsProvider } from "@modules/org/account-screens"
import { useLocale } from "next-intl"
import type { ReactNode } from "react"
import { useMemo } from "react"
import {
  studioAbsolutePath,
  studioOrgPath,
  studioSettingsPath,
} from "@/shared/org/studio-org.paths"

function absoluteStudioPath(locale: string, path: string): string {
  const suffix = studioAbsolutePath(locale, path)
  if (typeof window === "undefined") return suffix
  return `${window.location.origin}${suffix}`
}

export function StudioOrgAppPathsProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const locale = useLocale()
  const value = useMemo<OrgAppPaths>(
    () => ({
      afterCreateUrl: (org) =>
        org?.slug
          ? absoluteStudioPath(locale, studioOrgPath(org.slug))
          : absoluteStudioPath(locale, "/organizations"),
      createOrganizationUrl: absoluteStudioPath(locale, "/organizations/new"),
      organizationSettingsUrl: (org) =>
        org?.slug
          ? absoluteStudioPath(locale, studioSettingsPath(org.slug, "/general"))
          : absoluteStudioPath(locale, "/settings"),
      organizationsInvitationsUrl: absoluteStudioPath(
        locale,
        "/organizations/invitations"
      ),
      organizationsListUrl: absoluteStudioPath(locale, "/organizations"),
    }),
    [locale]
  )
  return <OrgAppPathsProvider value={value}>{children}</OrgAppPathsProvider>
}
