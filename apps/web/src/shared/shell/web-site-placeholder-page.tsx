import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import type { WebSiteNavLabelKey } from "@/shared/shell/web-site-navigation"
import type { LangPageProps } from "@/shared/types/web.app.types"

export interface WebSitePlaceholderPageInput extends LangPageProps {
  readonly titleKey: WebSiteNavLabelKey
}

export async function WebSitePlaceholderPage({
  params,
  titleKey,
}: WebSitePlaceholderPageInput) {
  const t = await getServerTranslations(params, "siteShell")

  return (
    <Shell.Section className="p-6" variant="site">
      <h1 className="text-lg font-medium">{t(titleKey)}</h1>
    </Shell.Section>
  )
}
