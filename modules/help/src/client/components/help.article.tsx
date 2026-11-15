import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { loadHelpArticle } from "../../server/help.loader"
import { HelpArticleScreen } from "./help.article.client"

export async function HelpArticlePage({ slug }: { readonly slug: string }) {
  const locale = await getLocale()
  const t = await getTranslations("ui")
  const article = loadHelpArticle(locale, slug)

  if (!article) {
    notFound()
  }

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("helpCenterDescription")}
          title={t("helpCenter")}
        >
          <HelpArticleScreen article={article} />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
