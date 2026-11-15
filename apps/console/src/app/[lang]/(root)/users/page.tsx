import { AdminUsersScreen } from "@modules/admin"
import { adminService } from "@modules/admin/server"
import { headers } from "next/headers"

import { requireConsoleAccess } from "@/shared/auth/console.session"
import { getServerTranslations } from "@/shared/i18n/console.i18n.server"
import type { LangPageProps } from "@/shared/types/console.app.types"

export default async function ConsoleUsersPage({ params }: LangPageProps) {
  const { lang } = await params
  const session = await requireConsoleAccess(lang)
  const t = await getServerTranslations(params, "adminUsers")
  const requestHeaders = await headers()
  const result = await adminService.users.list({
    auth: session,
    headers: requestHeaders,
    query: { limit: 50, offset: 0 },
  })

  return (
    <AdminUsersScreen
      labels={{
        active: t("active"),
        banned: t("banned"),
        email: t("email"),
        empty: t("empty"),
        name: t("name"),
        no: t("no"),
        role: t("role"),
        status: t("status"),
        verified: t("verified"),
        yes: t("yes"),
      }}
      title={t("title")}
      users={result.users}
    />
  )
}
