"use client"

import { useShellNavigation } from "@features/shell"
import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { HelpArticle } from "../../utils/types/help.types.article"
import { HelpArticleBody } from "./help.article-body.client"

export function HelpArticleScreen({
  article,
}: {
  readonly article: HelpArticle
}) {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()

  return (
    <div className="space-y-4">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        href="/account/help-support/help-center"
      >
        <ArrowLeftIcon aria-hidden className="size-4" />
        {t("helpBackToHelpCenter")}
      </Link>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          {article.title}
        </h2>
        {article.localeFallback ? (
          <p className="text-xs text-muted-foreground">
            {t("helpLocaleFallbackNotice")}
          </p>
        ) : null}
      </div>
      <HelpArticleBody body={article.body} />
    </div>
  )
}
