import { ActivityResourceView } from "@modules/activity"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgActivityPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  await requireStudioOrganization(lang, org)
  return <ActivityResourceView />
}
