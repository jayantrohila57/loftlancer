import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioAccess } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioCreateOrganizationForm } from "@/shared/onboarding/studio-create-organization-form"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsNewPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioAccess(lang, { returnPath: `/${lang}/organizations/new` })
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationCreateDescription")}
          title={t("createOrganization")}
        >
          <StudioCreateOrganizationForm nextPath="org-home" />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
