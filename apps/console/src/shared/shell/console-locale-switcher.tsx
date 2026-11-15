"use client"

import { ShellLocaleSwitcherIconButton } from "@features/shell"
import { i18nConfig, usePathname, useRouter } from "@/shared/i18n/console.i18n"

export function LocaleSwitcherIconButton() {
  return (
    <ShellLocaleSwitcherIconButton
      locales={i18nConfig.locales}
      usePathname={usePathname}
      useRouter={useRouter}
    />
  )
}
