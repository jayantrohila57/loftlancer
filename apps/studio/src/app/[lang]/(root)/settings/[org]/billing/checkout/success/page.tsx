import { BillingClientReturnEffects } from "@modules/billing"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import { Button } from "@packages/ui/components/button"
import Shell from "@packages/ui/components/shell"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioSettingsPath } from "@/shared/org/studio-org.paths"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgCheckoutSuccessPage({
  params,
}: OrgPageProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("checkoutSuccessDescription")}
          title={t("checkoutSuccessTitle")}
        >
          <BillingClientReturnEffects />
          <Button
            render={
              <Link href={studioSettingsPath(org, "/billing")}>
                {t("backToBilling")}
              </Link>
            }
          />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
