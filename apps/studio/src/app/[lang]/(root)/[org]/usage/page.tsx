import { BillingUsageEntitlementsPage } from "@modules/billing"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgPath } from "@/shared/org/studio-org.paths"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgUsagePage({ params }: OrgPageProps) {
  const { lang, org } = await params
  const { organization } = await requireStudioOrganization(lang, org)
  if (studioOrgRoleAccess(organization.role).canViewBillingDetails) {
    return <BillingUsageEntitlementsPage />
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("billingUsageEntitlementsDescription")}
          title={t("usageAndEntitlements")}
        >
          <p className="text-sm text-muted-foreground">
            {t("aiUsageOverviewDescription")}
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href={studioOrgPath(org, "/usage/ai")}
              >
                {t("aiUsage")}
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href={studioOrgPath(org, "/usage/storage")}
              >
                {t("storage")}
              </Link>
            </li>
          </ul>
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
