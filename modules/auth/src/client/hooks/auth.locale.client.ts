"use client"

import { useLocale } from "next-intl"

/** Active `[lang]` segment from the app’s `I18nClientProvider`. */
export function useAuthLocale(): string {
  return useLocale()
}
