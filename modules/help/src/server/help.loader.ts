import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { defaultAppLocale } from "@features/i18n/constants"

import { helpContentRoot } from "../utils/help.content-root"
import {
  parseHelpArticleFile,
  toHelpArticleIndex,
} from "../utils/help.parse-article"
import type {
  HelpArticle,
  HelpArticleIndex,
} from "../utils/types/help.types.article"

const FALLBACK_LOCALE = defaultAppLocale

function localeDirectory(locale: string): string {
  return join(helpContentRoot(), locale)
}

function listMasterSlugs(): string[] {
  const directory = localeDirectory(FALLBACK_LOCALE)
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
    .sort((left, right) => left.localeCompare(right))
}

function articlePath(locale: string, slug: string): string {
  return join(localeDirectory(locale), `${slug}.md`)
}

export function loadHelpArticle(
  locale: string,
  slug: string
): HelpArticle | null {
  const localized = articlePath(locale, slug)
  if (existsSync(localized)) {
    return parseHelpArticleFile(localized, false)
  }
  const fallback = articlePath(FALLBACK_LOCALE, slug)
  if (existsSync(fallback)) {
    return parseHelpArticleFile(fallback, locale !== FALLBACK_LOCALE)
  }
  return null
}

export function listHelpArticles(locale: string): readonly HelpArticleIndex[] {
  return listMasterSlugs().flatMap((slug) => {
    const article = loadHelpArticle(locale, slug)
    if (!article) {
      return []
    }
    return [toHelpArticleIndex(article)]
  })
}
