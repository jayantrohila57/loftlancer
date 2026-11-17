import { Link } from "@/shared/i18n/web.i18n"
import Shell from "@packages/ui/components/shell"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import {
  WEB_HELP_CATEGORIES,
  getWebHelpArticlesByCategory,
} from "@/shared/help/web-help-articles"
import { WebHelpStillNeedBlock } from "@/shared/help/web-help-still-need-block"
import { WebHelpSearchForm } from "@/shared/help/web-help-search-form.client"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function WebHelpCenterPage({ params }: LangPageProps) {
  const { lang } = await params
  const t = await getServerTranslations(params, "helpCenter")

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-16">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {t("description")}
          </p>
        </header>
        <WebHelpSearchForm label={t("searchLabel")} placeholder={t("searchPlaceholder")} />
        <div className="flex flex-col gap-10">
          {WEB_HELP_CATEGORIES.map((categoryId) => {
            const articles = getWebHelpArticlesByCategory(categoryId)
            if (articles.length === 0) {
              return null
            }
            return (
              <section className="space-y-4" key={categoryId}>
                <h2 className="text-xl font-semibold tracking-tight">
                  {t(`categories.${categoryId}.title`)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t(`categories.${categoryId}.description`)}
                </p>
                <ul className="flex flex-col gap-2">
                  {articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        href={`/help/${article.slug}`}
                      >
                        {t(`articles.${article.slug}.title`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
        <WebHelpStillNeedBlock
          contactHref="/contact"
          locale={lang}
          copy={{
            title: t("stillNeedHelp.title"),
            body: t("stillNeedHelp.body"),
            contactCta: t("stillNeedHelp.contactCta"),
            ticketsCta: t("stillNeedHelp.ticketsCta"),
          }}
        />
      </div>
    </Shell.Section>
  )
}