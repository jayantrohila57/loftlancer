import { notFound } from "next/navigation"
import Shell from "@packages/ui/components/shell"
import { Link } from "@/shared/i18n/web.i18n"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import {
  getWebHelpArticle,
  type WebHelpArticleSlug,
} from "@/shared/help/web-help-articles"
import { WebHelpStillNeedBlock } from "@/shared/help/web-help-still-need-block"
import type { LangPageProps } from "@/shared/types/web.app.types"

type ArticleSection = {
  readonly heading: string
  readonly paragraphs: readonly string[]
}

export interface WebHelpArticlePageInput extends LangPageProps {
  readonly slug: string
}

export async function WebHelpArticlePage({
  params,
  slug,
}: WebHelpArticlePageInput) {
  const article = getWebHelpArticle(slug)
  if (!article) {
    notFound()
  }

  const { lang } = await params
  const t = await getServerTranslations(params, "helpCenter")
  const sections = t.raw(
    `articles.${article.slug as WebHelpArticleSlug}.sections`
  ) as readonly ArticleSection[]

  return (
    <Shell.Section className="min-h-screen px-6 py-16" variant="site">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-16">
        <p className="text-sm text-muted-foreground">
          <Link className="underline-offset-4 hover:underline" href="/help">
            {t("backToHelp")}
          </Link>
        </p>
        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t(`articles.${article.slug}.title`)}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {t(`articles.${article.slug}.summary`)}
          </p>
        </header>
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section className="space-y-3" key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  className="text-sm leading-relaxed text-pretty text-muted-foreground"
                  key={paragraph.slice(0, 48)}
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
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
      </article>
    </Shell.Section>
  )
}