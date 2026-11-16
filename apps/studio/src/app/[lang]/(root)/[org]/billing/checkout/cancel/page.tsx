import { Button } from "@packages/ui/components/button"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgPath } from "@/shared/org/studio-org.paths"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgCheckoutCancelPage({
  params,
}: OrgPageProps) {
  const { lang, org } = await params
  await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("checkoutCancelTitle")}
      description={t("checkoutCancelDescription")}
    >
      <Button
        render={
          <Link href={studioOrgPath(org, "/billing")}>
            {t("backToBilling")}
          </Link>
        }
        variant="outline"
      />
    </StudioPageSection>
  )
}
