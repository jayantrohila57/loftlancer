"use client"

import { lazy } from "react"

const LazyLanguageSelector = lazy(() =>
  import("./console-locale-switcher").then((module) => ({
    default: module.LocaleSwitcherIconButton,
  }))
)

export function HeaderLanguageSelector() {
  return <LazyLanguageSelector />
}
