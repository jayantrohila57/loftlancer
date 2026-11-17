"use client"

import { ShellSidebarNav } from "@features/shell"
import type { ShellTranslate } from "@modules/shell"
import { accountSidebarNavGroups } from "@modules/shell"
import { useTranslations } from "next-intl"

import { AuthOpenStudioLink } from "@/shared/shell/auth-open-studio-link.client"

export function AuthAccountSidebarNavContent() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  return (
    <ShellSidebarNav
      leading={<AuthOpenStudioLink />}
      groups={accountSidebarNavGroups(translate)}
    />
  )
}
