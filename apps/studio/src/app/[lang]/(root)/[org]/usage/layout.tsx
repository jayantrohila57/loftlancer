import { WalletCards } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioUsageSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgUsageLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioOrgSectionLayout
      description={t("billingUsageEntitlementsDescription")}
      icon={WalletCards}
      tabs={studioUsageSectionTabs(org, t)}
      title={t("usageAndEntitlements")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
