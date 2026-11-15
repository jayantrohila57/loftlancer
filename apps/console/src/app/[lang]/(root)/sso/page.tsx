import { SsoConnectionsAdminScreen } from "@modules/sso"
import { ssoService } from "@modules/sso/server"
import { requireConsoleAccess } from "@/shared/auth/console.session"
import { getServerTranslations } from "@/shared/i18n/console.i18n.server"
import type { LangPageProps } from "@/shared/types/console.app.types"

export default async function ConsoleSsoPage({ params }: LangPageProps) {
  const { lang } = await params
  const session = await requireConsoleAccess(lang)
  const t = await getServerTranslations(params, "adminSso")
  const result = await ssoService.connections.list({
    auth: session,
  })

  return (
    <SsoConnectionsAdminScreen
      connections={result.connections}
      labels={{
        description: t("description"),
        domain: t("domain"),
        empty: t("empty"),
        issuer: t("issuer"),
        protocol: t("protocol"),
        providerId: t("providerId"),
      }}
      title={t("title")}
    />
  )
}
