import { requireConsoleAccess } from "@/shared/auth/console.session"
import { getServerTranslations } from "@/shared/i18n/console.i18n.server"
import type { LangPageProps } from "@/shared/types/console.app.types"

export default async function ConsoleHomePage({ params }: LangPageProps) {
  const { lang } = await params
  await requireConsoleAccess(lang)
  const t = await getServerTranslations(params, "home")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </div>
  )
}
