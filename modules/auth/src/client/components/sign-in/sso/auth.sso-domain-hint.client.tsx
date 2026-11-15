"use client"

import { useTranslations } from "next-intl"

import { useAuthSsoSignInContext } from "./auth.sso-sign-in.context.client"

function readEmailDomain(email: string): string | null {
  const at = email.indexOf("@")
  if (at < 1) return null
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
  return domain.length > 0 ? domain : null
}

export function AuthSsoDomainHint() {
  const t = useTranslations("ui")
  const { email } = useAuthSsoSignInContext()
  const domain = readEmailDomain(email)
  if (!domain) return null

  return (
    <p className="text-sm text-muted-foreground" role="status">
      {t("enterpriseSsoDomainDiscovery", { domain })}
    </p>
  )
}
