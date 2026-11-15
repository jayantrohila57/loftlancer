"use client"

import type {
  LocaleSwitcherControlProps,
  LocaleSwitcherNavigation,
} from "@features/i18n/locale-switcher"
import {
  LocaleSwitcherCombobox as LocaleSwitcherComboboxBase,
  LocaleSwitcherIconButton as LocaleSwitcherIconButtonBase,
} from "@features/i18n/locale-switcher"

export interface ShellLocaleSwitcherProps extends LocaleSwitcherControlProps {
  readonly locales: readonly string[]
  readonly usePathname: () => string
  readonly useRouter: LocaleSwitcherNavigation["useRouter"]
}

export function ShellLocaleSwitcherCombobox({
  locales,
  usePathname,
  useRouter,
  ...props
}: ShellLocaleSwitcherProps) {
  return (
    <LocaleSwitcherComboboxBase
      {...props}
      locales={locales}
      usePathname={usePathname}
      useRouter={useRouter}
    />
  )
}

export function ShellLocaleSwitcherIconButton({
  locales,
  usePathname,
  useRouter,
  ...props
}: ShellLocaleSwitcherProps) {
  return (
    <LocaleSwitcherIconButtonBase
      {...props}
      locales={locales}
      usePathname={usePathname}
      useRouter={useRouter}
    />
  )
}
