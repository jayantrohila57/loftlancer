import { readActiveOrganizationId } from "@modules/org"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { listStudioOrganizationsForSession } from "@/shared/auth/studio.session"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioSettingsPath } from "@/shared/org/studio-org.paths"
import { redirectStudio } from "@/shared/org/studio-org.redirect"
import {
  pickStudioLandingSlug,
  readLastStudioOrgSlug,
} from "@/shared/org/studio-org.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioSettingsIndexPage({
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
  if (slug) {
    redirectStudio(lang, studioSettingsPath(slug, "/general"))
  }
  if (organizations.length === 0) {
    redirectStudio(lang, "/onboarding")
  }
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationCategorySummary")}
          title={t("organizationSettings")}
        >
          <ul className="flex flex-col gap-2 text-sm">
            {organizations.map((organization) => (
              <li key={organization.id}>
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  href={studioSettingsPath(organization.slug, "/general")}
                >
                  {organization.name}
                </Link>
              </li>
            ))}
          </ul>
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
