import { Activity } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgPath } from "@/shared/org/studio-org.paths"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgActivityLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioOrgSectionLayout
      description={t("resourceActivity")}
      icon={Activity}
      tabs={[
        {
          href: studioOrgPath(org, "/activity"),
          label: t("overview"),
          value: "overview",
        },
      ]}
      title={t("activity")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
