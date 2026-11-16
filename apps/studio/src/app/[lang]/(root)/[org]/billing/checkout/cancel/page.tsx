import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import { Button } from "@packages/ui/components/button"
import Shell from "@packages/ui/components/shell"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgPath } from "@/shared/org/studio-org.paths"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgCheckoutCancelPage({
  params,
}: OrgPageProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("checkoutCancelDescription")}
          title={t("checkoutCancelTitle")}
        >
          <Button
            render={
              <Link href={studioOrgPath(org, "/billing")}>
                {t("backToBilling")}
              </Link>
            }
            variant="outline"
          />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
