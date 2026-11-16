import { requireStudioAccess } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioCreateOrganizationForm } from "@/shared/onboarding/studio-create-organization-form"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsNewPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioAccess(lang, { returnPath: `/${lang}/organizations/new` })
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("createOrganization")}
      description={t("organizationCreateDescription")}
    >
      <StudioCreateOrganizationForm nextPath="org-home" />
    </StudioPageSection>
  )
}
