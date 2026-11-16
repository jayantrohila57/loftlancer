import { OrgInvitationsScreen } from "@modules/org/account-screens"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioAccess } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsInvitationsPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioAccess(lang, {
    returnPath: `/${lang}/organizations/invitations`,
  })
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationInvitationsSummary")}
          title={t("organizationInvitations")}
        >
          <OrgInvitationsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
