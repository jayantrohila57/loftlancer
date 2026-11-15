"use client"

import type { BrowserRegionalDefaults } from "@features/i18n/browser-defaults"
import { detectBrowserRegionalDefaults } from "@features/i18n/browser-defaults"
import { useEffect, useState } from "react"

export function useBrowserRegionalDefaults(): BrowserRegionalDefaults | null {
  const [defaults, setDefaults] = useState<BrowserRegionalDefaults | null>(null)
  useEffect(() => {
    setDefaults(detectBrowserRegionalDefaults())
  }, [])
  return defaults
}
