"use client"

import { createActionRegistry } from "@features/action"
import { ShellCommandMenu } from "@features/shell"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useCallback, useMemo } from "react"
import { useRouter } from "@/shared/i18n/web.i18n"
import { createWebSiteNavigationRegistry } from "@/shared/shell/web-site-navigation"

export interface WebSiteShellCommandMenuProps {
  readonly children: ReactNode
}

export function WebSiteShellCommandMenu({
  children,
}: WebSiteShellCommandMenuProps) {
  const t = useTranslations("command")
  const tSite = useTranslations("siteShell")
  const router = useRouter()

  const navigate = useCallback(
    (href: string) => {
      router.push(href)
    },
    [router]
  )

  const navigationRegistry = useMemo(
    () =>
      createWebSiteNavigationRegistry((key) => tSite(key), {
        groupLabels: {
          company: tSite("navGroupCompany"),
          legal: tSite("navGroupLegal"),
          product: tSite("navGroupProduct"),
          resources: tSite("navGroupResources"),
        },
      }),
    [tSite]
  )

  const actionRegistry = useMemo(() => createActionRegistry({ items: [] }), [])

  const labels = useMemo(
    () => ({
      dialogDescription: t("dialogDescription"),
      dialogTitle: t("dialogTitle"),
      empty: t("empty"),
      filterActions: t("filterActions"),
      filterAll: t("filterAll"),
      filterNavigation: t("filterNavigation"),
      footerClose: t("footerClose"),
      footerCloseKey: t("footerCloseKey"),
      footerInstructions: t("footerInstructions"),
      footerNavigate: t("footerNavigate"),
      footerNavigateDownKey: t("footerNavigateDownKey"),
      footerNavigateUpKey: t("footerNavigateUpKey"),
      footerOpenShortcut: t("footerOpenShortcut"),
      footerSelect: t("footerSelect"),
      navigateToHref: t.raw("navigateToHref"),
      placeholder: t("placeholder"),
      resultsStatus: t.raw("resultsStatus"),
      searchLabel: t("searchLabel"),
      sourceAction: t("sourceAction"),
      sourceNavigation: t("sourceNavigation"),
      triggerLabel: t("triggerLabel"),
    }),
    [t]
  )

  return (
    <ShellCommandMenu
      actionRegistry={actionRegistry}
      labels={labels}
      navigate={navigate}
      navigationRegistry={navigationRegistry}
    >
      {children}
    </ShellCommandMenu>
  )
}
