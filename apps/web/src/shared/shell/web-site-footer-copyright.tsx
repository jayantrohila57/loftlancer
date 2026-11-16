"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

interface WebSiteFooterCopyrightInput {
  readonly siteName: string
}

export function WebSiteFooterCopyright({
  siteName,
}: WebSiteFooterCopyrightInput) {
  const t = useTranslations("siteShell")
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  if (year === null) {
    return <>{t("footerCopyright", { year: "…", name: siteName })}</>
  }

  return <>{t("footerCopyright", { year, name: siteName })}</>
}
