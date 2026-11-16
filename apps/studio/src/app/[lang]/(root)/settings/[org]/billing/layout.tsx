import { CreditCard } from "lucide-react"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioBillingSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import { StudioUnauthorized } from "@/shared/shell/studio-unauthorized"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgBillingLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  if (!studioOrgRoleAccess(organization.role).canManageBilling) {
    return <StudioUnauthorized params={params} />
  }
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
