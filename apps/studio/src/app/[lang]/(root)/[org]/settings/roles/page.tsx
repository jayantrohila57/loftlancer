import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgPath } from "@/shared/org/studio-org.paths"
import { StudioPageSection } from "@/shared/shell/studio-page-section"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgRolesPage({ params }: OrgPageProps) {
  const { lang, org } = await params
  await requireStudioOrganization(lang, org)
  const t = await getServerTranslations(params, "ui")
  return (
    <StudioPageSection
      title={t("organizationRoles")}
      description={t("organizationRolesDescription")}
    >
      <dl className="grid gap-4 text-sm">
        <div>
          <dt className="font-medium">{t("organizationRoleOwner")}</dt>
          <dd className="text-muted-foreground">
            {t("organizationRoleOwnerDescription")}
          </dd>
        </div>
        <div>
          <dt className="font-medium">{t("organizationRoleManager")}</dt>
          <dd className="text-muted-foreground">
            {t("organizationRoleManagerDescription")}
          </dd>
        </div>
        <div>
          <dt className="font-medium">{t("organizationRoleMember")}</dt>
          <dd className="text-muted-foreground">
            {t("organizationRoleMemberDescription")}
          </dd>
        </div>
      </dl>
      <p className="text-sm">
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href={studioOrgPath(org, "/settings/members")}
        >
          {t("organizationMembers")}
        </Link>
      </p>
    </StudioPageSection>
  )
}
