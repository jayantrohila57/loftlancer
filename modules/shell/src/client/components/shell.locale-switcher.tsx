"use client"

import type { ShellLocaleSwitcherProps } from "@features/shell"
import {
  ShellLocaleSwitcherCombobox,
  ShellLocaleSwitcherIconButton,
} from "@features/shell"

export type AppLocaleSwitcherProps = Omit<
  ShellLocaleSwitcherProps,
  "locales" | "usePathname" | "useRouter"
>

export interface AppLocaleSwitcherBindings {
  readonly locales: readonly string[]
  readonly usePathname: ShellLocaleSwitcherProps["usePathname"]
  readonly useRouter: ShellLocaleSwitcherProps["useRouter"]
}

export function createAppLocaleSwitcher(bindings: AppLocaleSwitcherBindings) {
  return {
    LocaleSwitcherCombobox(props: AppLocaleSwitcherProps) {
      return <ShellLocaleSwitcherCombobox {...bindings} {...props} />
    },
    LocaleSwitcherIconButton(props: AppLocaleSwitcherProps) {
      return <ShellLocaleSwitcherIconButton {...bindings} {...props} />
    },
  }
}
