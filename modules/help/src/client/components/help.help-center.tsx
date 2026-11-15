import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { getLocale, getTranslations } from "next-intl/server"

import { listHelpArticles } from "../../server/help.loader"
import { HelpHelpCenterScreen } from "./help.help-center.client"

export async function HelpHelpCenterPage() {
  const locale = await getLocale()
  const t = await getTranslations("ui")
  const articles = listHelpArticles(locale)

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("helpCenterDescription")}
          title={t("helpCenter")}
        >
          <HelpHelpCenterScreen articles={articles} />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
