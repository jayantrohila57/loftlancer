import { OrgListScreen } from "@modules/org/account-screens"
import { requireStudioAccess } from "@/shared/auth/studio.session"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioAccess(lang, { returnPath: `/${lang}/organizations` })
  return <OrgListScreen />
}
