import { ShellAccountBlockedEmpty } from "@modules/shell"
import { Button } from "@packages/ui/components/button"
import Shell from "@packages/ui/components/shell"
import { Link } from "@/shared/i18n/studio.i18n"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import { studioOrgPath } from "@/shared/org/studio-org.paths"
import type { OrgPageProps } from "@/shared/types/studio.app.types"

export async function StudioUnauthorized({
  params,
  homeHref,
}: {
  readonly params: OrgPageProps["params"] | Promise<{ lang: string }>
  readonly homeHref?: string
}) {
  const resolved = await params
  const t = await getServerTranslations(params, "ui")
  const href =
    homeHref ??
    ("org" in resolved ? studioOrgPath(String(resolved.org)) : "/organizations")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountBlockedEmpty
        description={t("unauthorizedDescription")}
        title={t("unauthorizedTitle")}
      />
      <div className="px-4 pb-6">
        <Button
          render={<Link href={href}>{t("home")}</Link>}
          variant="outline"
        />
      </div>
    </Shell.Section>
  )
}
