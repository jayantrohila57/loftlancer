import {
  BillingClientReturnEffects,
  BillingInvoicesTableScreen,
  BillingOverviewScreen,
  BillingPlansScreen,
  BillingUsageEntitlementsScreen,
} from "@modules/billing"
import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioBillingPage({ params }: LangPageProps) {
  const t = await getServerTranslations(params, "ui")

  return (
    <Shell.Section variant="dashboard" className="p-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{t("billing")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("billingOverviewDescription")}
          </p>
        </div>
        <BillingClientReturnEffects />
        <BillingOverviewScreen />
        <BillingUsageEntitlementsScreen />
        <BillingPlansScreen />
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{t("billingInvoiceView")}</h2>
          <BillingInvoicesTableScreen variant="invoices" />
        </section>
      </div>
    </Shell.Section>
  )
}
