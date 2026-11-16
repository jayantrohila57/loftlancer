import { HardDrive } from "lucide-react"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { StudioOrgSectionLayout } from "@/shared/shell/studio-org-section-layout"
import { studioStorageSectionTabs } from "@/shared/shell/studio-org-section-tabs"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgStorageLayout({
  children,
  params,
}: OrgLayoutProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioOrgSectionLayout
      description={t("storageSectionDescription")}
      icon={HardDrive}
      tabs={studioStorageSectionTabs(org, t)}
      title={t("storage")}
    >
      {children}
    </StudioOrgSectionLayout>
  )
}
