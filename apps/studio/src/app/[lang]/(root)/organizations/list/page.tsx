import { redirectStudio } from "@/shared/org/studio-org.redirect"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrganizationsListRedirectPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  redirectStudio(lang, "/organizations")
}
