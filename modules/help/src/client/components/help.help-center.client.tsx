"use client"

import { FieldKit } from "@features/form"
import { useShellNavigation } from "@features/shell"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { z } from "zod"
import type {
  HelpArticleCategory,
  HelpArticleIndex,
} from "../../utils/types/help.types.article"

const helpSearchSchema = z.object({
  query: z.string(),
})

const categoryOrder: readonly HelpArticleCategory[] = [
  "billing",
  "storage",
  "organization",
  "security",
]

function categoryLabel(
  translate: ReturnType<typeof useTranslations<"ui">>,
  category: HelpArticleCategory
): string {
  switch (category) {
    case "billing":
      return translate("helpCategoryBilling")
    case "storage":
      return translate("helpCategoryStorage")
    case "organization":
      return translate("helpCategoryOrganization")
    case "security":
      return translate("helpCategorySecurity")
  }
}

export function HelpHelpCenterScreen({
  articles,
}: {
  readonly articles: readonly HelpArticleIndex[]
}) {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return articles
    }
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalized) ||
        article.excerpt.toLowerCase().includes(normalized)
    )
  }, [articles, query])

  const grouped = useMemo(() => {
    const map = new Map<HelpArticleCategory, HelpArticleIndex[]>()
    for (const category of categoryOrder) {
      map.set(category, [])
    }
    for (const article of filtered) {
      const list = map.get(article.category) ?? []
      list.push(article)
      map.set(article.category, list)
    }
    return map
  }, [filtered])

  return (
    <div className="space-y-6">
      <FieldKit
        onValuesChange={(next) => {
          setQuery(typeof next.query === "string" ? next.query : "")
        }}
        schema={helpSearchSchema}
        values={{ query }}
      >
        <FieldKit.Field
          label={t("helpSearchArticles")}
          name="query"
          placeholder={t("helpSearchPlaceholder")}
          type="search"
        />
      </FieldKit>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("helpNoSearchResults")}
        </p>
      ) : (
        categoryOrder.map((category) => {
          const items = grouped.get(category) ?? []
          if (items.length === 0) {
            return null
          }
          return (
            <section className="space-y-3" key={category}>
              <h3 className="text-sm font-medium text-foreground">
                {categoryLabel(t, category)}
              </h3>
              <ul className="space-y-3">
                {items.map((article) => (
                  <li key={article.slug}>
                    <Link
                      className="block rounded-lg border border-border p-3 hover:bg-muted/50"
                      href={`/account/help-support/help-center/${article.slug}`}
                    >
                      <p className="font-medium text-foreground">
                        {article.title}
                        {article.localeFallback ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {t("helpLocaleFallbackBadge")}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {article.excerpt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
