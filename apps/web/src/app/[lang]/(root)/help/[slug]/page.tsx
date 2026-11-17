import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { WebHelpArticlePage } from "@/shared/help/web-help-article-page"
import {
  getWebHelpArticle,
  WEB_HELP_ARTICLE_SLUGS,
} from "@/shared/help/web-help-articles"
import {
  generateLangStaticParams,
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import type { LangPageProps } from "@/shared/types/web.app.types"

type HelpArticlePageProps = LangPageProps & {
  readonly params: Promise<{ lang: string; slug: string }>
}

export function generateStaticParams() {
  return generateLangStaticParams().flatMap(({ lang }) =>
    WEB_HELP_ARTICLE_SLUGS.map((slug) => ({ lang, slug }))
  )
}

export async function generateMetadata({
  params,
}: HelpArticlePageProps): Promise<Metadata> {
  const { slug, lang } = await params
  if (!getWebHelpArticle(slug)) {
    notFound()
  }
  const resolvedParams = Promise.resolve({ lang })
  await initRequestI18n(resolvedParams)
  const t = await getServerTranslations(resolvedParams, "helpCenter")
  return {
    title: `${t(`articles.${slug}.title`)} · Loftlancer`,
    description: t(`articles.${slug}.summary`),
  }
}

export default async function HelpArticleRoute({
  params,
}: HelpArticlePageProps) {
  const { slug } = await params
  if (!getWebHelpArticle(slug)) {
    notFound()
  }
  return WebHelpArticlePage({ params, slug })
}
