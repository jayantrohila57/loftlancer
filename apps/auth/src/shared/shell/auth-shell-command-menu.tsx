"use client"

import { createActionRegistry, mergeActionItems } from "@features/action"
import type { CommandPaletteItem } from "@features/command"
import { createNavigationRegistry } from "@features/navigation"
import { ShellCommandMenu } from "@features/shell"
import { useTheme } from "@features/theme"
import { authSessionApi, buildAfterSignOutLocation } from "@modules/auth"
import { defineConnectedAccountsCommandActions } from "@modules/connected-accounts/utils"
import { defineDeviceAuthorizationCommandActions } from "@modules/device-authorization/utils"
import { defineAccountDeletionCommandActions } from "@modules/security/utils"
import { defineSessionsCommandActions } from "@modules/sessions/utils"
import { accountSidebarNavGroups } from "@modules/shell"
import { createRuntimeLogger } from "@packages/logger"
import { toastManager } from "@packages/ui/components/toast"
import { LogOut, Moon, Sun } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useCallback, useMemo } from "react"
import { useRouter } from "@/shared/i18n/auth.i18n"
import { defineAuthAccountNavigationItems } from "@/shared/shell/auth-account-command-navigation"

export interface AuthShellCommandMenuProps {
  readonly children: ReactNode
}

export function AuthShellCommandMenu({ children }: AuthShellCommandMenuProps) {
  const tCommand = useTranslations("command")
  const tUi = useTranslations("ui")
  const router = useRouter()
  const locale = useLocale()
  const signOutMutation = authSessionApi.useSignOut()
  const { resolvedTheme, setTheme } = useTheme()

  const signOut = useCallback(async () => {
    if (signOutMutation.isPending) return
    try {
      await toastManager.promise(signOutMutation.mutateAsync(), {
        loading: tUi("signingOut"),
        success: tUi("signedOut"),
        error: (error: unknown) =>
          error instanceof Error ? error.message : tUi("couldNotSignOut"),
      })
      window.location.assign(buildAfterSignOutLocation({ locale }))
    } catch {
      // The toast already reports the error and the user can retry.
    }
  }, [locale, signOutMutation, tUi])

  const commandLogger = useMemo(
    () => createRuntimeLogger({ app: "auth", module: "command" }),
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
        items: defineAuthAccountNavigationItems(
          accountSidebarNavGroups(tUi),
          tUi
        ),
      }),
    [tUi]
  )

  const labels = useMemo(
    () => ({
      dialogDescription: tCommand("dialogDescription"),
      dialogTitle: tCommand("dialogTitle"),
      empty: tCommand("empty"),
      filterActions: tCommand("filterActions"),
      filterAll: tCommand("filterAll"),
      filterNavigation: tCommand("filterNavigation"),
      footerClose: tCommand("footerClose"),
      footerCloseKey: tCommand("footerCloseKey"),
      footerInstructions: tCommand("footerInstructions"),
      footerNavigate: tCommand("footerNavigate"),
      footerNavigateDownKey: tCommand("footerNavigateDownKey"),
      footerNavigateUpKey: tCommand("footerNavigateUpKey"),
      footerOpenShortcut: tCommand("footerOpenShortcut"),
      footerSelect: tCommand("footerSelect"),
      navigateToHref: tCommand.raw("navigateToHref"),
      placeholder: tCommand("placeholder"),
      resultsStatus: tCommand.raw("resultsStatus"),
      searchLabel: tCommand("searchLabel"),
      sourceAction: tCommand("sourceAction"),
      sourceNavigation: tCommand("sourceNavigation"),
      triggerLabel: tCommand("triggerLabel"),
    }),
    [tCommand]
  )

  const actionRegistry = useMemo(() => {
    const isDark = resolvedTheme === "dark"

    return createActionRegistry({
      items: mergeActionItems(
        [
          {
            groupLabel: tCommand("actionsGroup"),
            handler: { kind: "run", run: signOut },
            icon: LogOut,
            id: "account.sign-out",
            keywords: ["logout", "sign out"],
            label: tUi("signOut"),
            order: 1,
            placements: ["command"],
          },
          {
            description: tCommand("toggleThemeDescription"),
            groupLabel: tCommand("actionsGroup"),
            handler: {
              kind: "run",
              run: () => setTheme(isDark ? "light" : "dark"),
            },
            icon: isDark ? Sun : Moon,
            id: "theme.toggle",
            keywords: ["theme", "dark", "light", "appearance"],
            label: tCommand("toggleTheme"),
            order: 0,
            placements: ["command"],
          },
        ],
        defineSessionsCommandActions(tUi),
        defineConnectedAccountsCommandActions(tUi),
        defineDeviceAuthorizationCommandActions(tUi),
        defineAccountDeletionCommandActions(tUi)
      ),
    })
  }, [resolvedTheme, setTheme, signOut, tCommand, tUi])

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
