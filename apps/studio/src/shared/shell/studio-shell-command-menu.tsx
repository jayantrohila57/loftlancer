"use client"

import { createActionRegistry } from "@features/action"
import type { CommandPaletteItem } from "@features/command"
import {
  createNavigationRegistry,
  defineHomeNavigationItems,
} from "@features/navigation"
import { ShellCommandMenu } from "@features/shell"
import { useTheme } from "@features/theme"
import { createRuntimeLogger } from "@packages/logger"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useCallback, useMemo } from "react"
import { useRouter } from "@/shared/i18n/studio.i18n"

export interface StudioShellCommandMenuProps {
  readonly children: ReactNode
  readonly groupLabel: string
}

export function StudioShellCommandMenu({
  children,
  groupLabel,
}: StudioShellCommandMenuProps) {
  const t = useTranslations("command")
  const tUi = useTranslations("ui")
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const commandLogger = useMemo(
    () => createRuntimeLogger({ app: "studio", module: "command" }),
    []
  )

  const navigate = useCallback(
    (href: string) => {
      router.push(href)
    },
    [router]
  )

  const onCommandRunError = useCallback(
    (_error: unknown, item: CommandPaletteItem) => {
      commandLogger.error("command.run_failed", {
        actionId: item.id,
        outcome: "error",
      })
    },
    [commandLogger]
  )

  const navigationRegistry = useMemo(
    () =>
      createNavigationRegistry({
        items: defineHomeNavigationItems({
          groupLabel,
          homeDescription: t("homeDescription"),
          homeLabel: tUi("home"),
        }),
      }),
    [groupLabel, t, tUi]
  )

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

  const actionRegistry = useMemo(() => {
    const isDark = resolvedTheme === "dark"

    return createActionRegistry({
      items: [
        {
          description: t("toggleThemeDescription"),
          groupLabel: t("actionsGroup"),
          handler: {
            kind: "run",
            run: () => setTheme(isDark ? "light" : "dark"),
          },
          icon: isDark ? Sun : Moon,
          id: "theme.toggle",
          keywords: ["theme", "dark", "light", "appearance"],
          label: t("toggleTheme"),
          order: 0,
          placements: ["command"],
        },
      ],
    })
  }, [resolvedTheme, setTheme, t])

  return (
    <ShellCommandMenu
      actionRegistry={actionRegistry}
      labels={labels}
      navigate={navigate}
      navigationRegistry={navigationRegistry}
      onCommandRunError={onCommandRunError}
    >
      {children}
    </ShellCommandMenu>
  )
}
