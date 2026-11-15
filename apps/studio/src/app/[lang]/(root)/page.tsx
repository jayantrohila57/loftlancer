import { requireStudioAccess } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioHomePage({ params }: LangPageProps) {
  const { lang } = await params
  await requireStudioAccess(lang)
  const t = await getServerTranslations(params, "home")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </div>
  )
}
