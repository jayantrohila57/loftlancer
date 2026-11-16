import { OrgListScreen } from "@modules/org/account-screens"
import { requireStudioAccess } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioAccess(lang, { returnPath: `/${lang}/organizations` })
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("organizations")}
      description={t("organizationsDashboardDescription")}
    >
      <OrgListScreen />
    </StudioPageSection>
  )
}
