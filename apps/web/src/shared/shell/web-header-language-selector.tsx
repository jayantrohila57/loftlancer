"use client"

import { lazy } from "react"

const LazyLanguageSelector = lazy(() =>
  import("@/shared/shell/web-locale-switcher").then((module) => ({
    default: module.LocaleSwitcherIconButton,
  }))
)

export function HeaderLanguageSelector() {
  return <LazyLanguageSelector />
}
