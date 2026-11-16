import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgPath } from "@/shared/org/studio-org.paths"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOrgRolesPage({ params }: OrgPageProps) {
  const { org } = await params
  const t = await getServerTranslations(params, "ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("organizationRolesDescription")}
          title={t("organizationRoles")}
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
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
