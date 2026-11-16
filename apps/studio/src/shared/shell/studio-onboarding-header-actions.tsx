"use client"

import { SiteMarketingHeaderActions } from "@features/shell"
import { AccountUserMenuLoader } from "@modules/shell"
import { HeaderLanguageSelector } from "@/shared/shell/studio-header-language-selector"

export function StudioOnboardingHeaderActions() {
  return (
    <SiteMarketingHeaderActions
      languageSelector={<HeaderLanguageSelector />}
      userMenu={<AccountUserMenuLoader />}
    />
  )
}