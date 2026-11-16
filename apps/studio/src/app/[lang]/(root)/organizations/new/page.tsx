import { OrgCreateScreen } from "@modules/org/account-screens"
import { requireStudioAccess } from "@/shared/auth/studio.session"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsNewPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  await requireStudioAccess(lang, { returnPath: `/${lang}/organizations/new` })
  return <OrgCreateScreen />
}
