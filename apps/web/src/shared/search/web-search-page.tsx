import Shell from "@packages/ui/components/shell"
import type { WebHelpArticleSlug } from "@/shared/help/web-help-articles"
import { WEB_HELP_ARTICLE_SLUGS } from "@/shared/help/web-help-articles"
import { WebHelpSearchForm } from "@/shared/help/web-help-search-form.client"
import { Link } from "@/shared/i18n/web.i18n"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import { webSiteNavItemSpecs } from "@/shared/shell/web-site-navigation"
import type { LangPageProps } from "@/shared/types/web.app.types"

export interface WebSearchPageInput extends LangPageProps {
  readonly query: string
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase()
}

export async function WebSearchPage({ params, query }: WebSearchPageInput) {
  const tPage = await getServerTranslations(params, "searchPage")
  const tSite = await getServerTranslations(params, "siteShell")
  const tHelp = await getServerTranslations(params, "helpCenter")
  const normalized = normalizeSearchText(query)

  const navHits =
    normalized.length > 0
      ? webSiteNavItemSpecs.filter((item) => {
          const label = tSite(item.labelKey).toLowerCase()
          const description = item.descriptionKey
            ? tSite(item.descriptionKey).toLowerCase()
            : ""
          const keywords = (item.keywords ?? []).join(" ").toLowerCase()
          return (
            label.includes(normalized) ||
            description.includes(normalized) ||
            keywords.includes(normalized) ||
            item.href.includes(normalized)
          )
        })
      : []

  const articleHits =
    normalized.length > 0
      ? WEB_HELP_ARTICLE_SLUGS.filter((slug) => {
          const title = tHelp(`articles.${slug}.title`).toLowerCase()
          const summary = tHelp(`articles.${slug}.summary`).toLowerCase()
          return title.includes(normalized) || summary.includes(normalized)
        })
      : []

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {tPage("title")}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {tPage("description")}
          </p>
        </header>
        <WebHelpSearchForm
          label={tHelp("searchLabel")}
          placeholder={tHelp("searchPlaceholder")}
        />
        {normalized.length === 0 ? (
          <p className="text-sm text-muted-foreground">{tPage("emptyQuery")}</p>
        ) : (
          <div className="flex flex-col gap-8">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {tPage("pagesHeading")}
              </h2>
              {navHits.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {tPage("noPageResults")}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {navHits.map((item) => (
                    <li key={item.id}>
                      <Link
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        href={item.href}
                      >
                        {tSite(item.labelKey)}
                      </Link>
                      {item.descriptionKey ? (
                        <p className="text-xs text-muted-foreground">
                          {tSite(item.descriptionKey)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {tPage("articlesHeading")}
              </h2>
              {articleHits.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {tPage("noArticleResults")}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {articleHits.map((slug) => (
                    <li key={slug}>
                      <Link
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        href={`/help/${slug as WebHelpArticleSlug}`}
                      >
                        {tHelp(`articles.${slug}.title`)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {tHelp(`articles.${slug}.summary`)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </Shell.Section>
  )
}
