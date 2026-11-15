"use client"

import { createAppLocaleSwitcher } from "@modules/shell"

import { i18nConfig, usePathname, useRouter } from "@/shared/i18n/web.i18n"

export const { LocaleSwitcherCombobox, LocaleSwitcherIconButton } =
  createAppLocaleSwitcher({
    locales: i18nConfig.locales,
    usePathname,
    useRouter,
  })
