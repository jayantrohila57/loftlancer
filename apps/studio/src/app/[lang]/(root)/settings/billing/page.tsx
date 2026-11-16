import { readActiveOrganizationId } from "@modules/org"
import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { studioSettingsPath } from "@/shared/org/studio-org.paths"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import {
  pickStudioLandingSlug,
  readLastStudioOrgSlug,
} from "@/shared/org/studio-org.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioLegacySettingsBillingPage({
  params,
}: LangPageProps) {
  const { lang } = await params
  const { session, organizations } =
    await listStudioOrganizationsForSession(lang)
  const lastSlug = await readLastStudioOrgSlug()
  const slug = pickStudioLandingSlug(organizations, {
    lastSlug,
    activeOrganizationId: readActiveOrganizationId(session),
  })
  if (!slug) {
    redirectStudio(lang, "/onboarding")
  }
  redirectStudio(lang, studioSettingsPath(slug, "/billing"))
}
