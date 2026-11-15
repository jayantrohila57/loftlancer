"use client"

import { NextIntlClientProvider } from "next-intl"
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"

import { defaultI18nTimeZone, i18nFormats } from "../config/i18n.formats"
import { detectBrowserRegionalDefaults } from "../utils/i18n.browser-defaults"

export type I18nProviderProps = ComponentProps<typeof NextIntlClientProvider>

export function I18nProvider({
  formats = i18nFormats,
  timeZone,
  ...props
}: I18nProviderProps) {
  const [browserTimeZone, setBrowserTimeZone] = useState<string | null>(null)
  useEffect(() => {
    if (!timeZone) setBrowserTimeZone(detectBrowserRegionalDefaults().timeZone)
  }, [timeZone])
  return (
    <NextIntlClientProvider
      {...props}
      formats={formats}
      timeZone={timeZone ?? browserTimeZone ?? defaultI18nTimeZone}
    />
  )
}
