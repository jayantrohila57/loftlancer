"use client"

import { SiteMarketingHeaderActions } from "@features/shell"
import { HeaderLanguageSelector } from "@/shared/shell/web-header-language-selector"
import { WebSiteHeaderAuth } from "@/shared/shell/web-site-header-auth"

export function WebSiteHeaderActions() {
  return (
    <SiteMarketingHeaderActions
      languageSelector={<HeaderLanguageSelector />}
      userMenu={<WebSiteHeaderAuth />}
    />
  )
}