import { listOrganizationBillingAdmin } from "@packages/billing"
import { getDb } from "@packages/drizzle"
import Shell from "@packages/ui/components/shell"
import { requireConsoleAccess } from "@/shared/auth/console.session"
import { ConsoleBillingAdminTable } from "@/shared/billing/console-billing-admin.client"
import { getServerTranslations } from "@/shared/i18n/console.i18n.server"
import type { LangPageProps } from "@/shared/types/console.app.types"

export default async function ConsoleBillingPage({ params }: LangPageProps) {
  const { lang } = await params
  await requireConsoleAccess(lang)
  const t = await getServerTranslations(params, "ui")
  const db = getDb()
  const orgs = db ? await listOrganizationBillingAdmin({ db, limit: 100 }) : []

  return (
    <Shell.Section variant="dashboard" className="p-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{t("billingAdminTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("billingAdminDescription")}
          </p>
        </div>
        <ConsoleBillingAdminTable orgs={orgs} />
      </div>
    </Shell.Section>
  )
}
