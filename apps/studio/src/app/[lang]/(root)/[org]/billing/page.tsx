import {
  BillingClientReturnEffects,
  BillingInvoicesTableScreen,
  BillingOverviewScreen,
  BillingPlansScreen,
  BillingUsageEntitlementsScreen,
} from "@modules/billing"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgBillingPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("billing")}
      description={t("billingOverviewDescription")}
    >
      <BillingClientReturnEffects />
      <BillingOverviewScreen />
      <BillingUsageEntitlementsScreen />
      <BillingPlansScreen />
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{t("billingInvoiceView")}</h2>
        <BillingInvoicesTableScreen variant="invoices" />
      </section>
    </StudioPageSection>
  )
}
