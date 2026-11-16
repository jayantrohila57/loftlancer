import { requireStudioAccess } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioInviteResponse } from "@/shared/org/studio-invite-response"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioInvitePage({
  params,
}: LangPageProps & {
  params: Promise<{ lang: string; invitationId: string }>
}) {
  const { lang, invitationId } = await params
  await requireStudioAccess(lang, {
    returnPath: `/${lang}/invite/${invitationId}`,
  })
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("organizationInvitations")}
      description={t("receivedInvitationsDescription")}
    >
      <StudioInviteResponse invitationId={invitationId} />
    </StudioPageSection>
  )
}
