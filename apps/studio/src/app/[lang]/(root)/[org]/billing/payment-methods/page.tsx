import { BillingPaymentMethodsPage } from "@modules/billing"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgPaymentMethodsPage({
  params,
}: OrgPageProps) {
  const { lang, org } = await params
  await requireStudioOrganization(lang, org)
  return <BillingPaymentMethodsPage />
}
