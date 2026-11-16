import { CreditCard } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioBillingSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgBillingLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioOrgSectionLayout
      description={t("billingOverviewDescription")}
      icon={CreditCard}
      tabs={studioBillingSectionTabs(org, t)}
      title={t("billing")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
