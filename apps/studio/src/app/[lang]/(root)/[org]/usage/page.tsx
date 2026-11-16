import { studioOrgPath } from "@/shared/org/studio-org.paths"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgUsageIndexPage({
  params,
}: OrgPageProps) {
  const { lang, org } = await params
  redirectStudio(lang, studioOrgPath(org, "/usage/ai"))
}
