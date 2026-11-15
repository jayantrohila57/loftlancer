import { readFileSync } from "node:fs"
import matter from "gray-matter"
import type {
  HelpArticle,
  HelpArticleCategory,
  HelpArticleIndex,
} from "./types/help.types.article"

const helpCategories = [
  "billing",
  "storage",
  "organization",
  "security",
] as const satisfies readonly HelpArticleCategory[]

function parseCategory(value: unknown): HelpArticleCategory {
  if (
    typeof value === "string" &&
    (helpCategories as readonly string[]).includes(value)
  ) {
    return value as HelpArticleCategory
  }
  throw new Error(`Invalid help article category: ${String(value)}`)
}

function parseFrontmatter(raw: string): {
  slug: string
  title: string
  category: HelpArticleCategory
  excerpt: string
  body: string
} {
  const { content, data } = matter(raw)
  const slug = typeof data.slug === "string" ? data.slug.trim() : ""
  const title = typeof data.title === "string" ? data.title.trim() : ""
  const excerpt = typeof data.excerpt === "string" ? data.excerpt.trim() : ""
  if (!slug || !title || !excerpt) {
    throw new Error(
      "Help article frontmatter requires slug, title, and excerpt"
    )
  }
  return {
    slug,
    title,
    category: parseCategory(data.category),
    excerpt,
    body: content.trim(),
  }
}

export function parseHelpArticleFile(
  filePath: string,
  localeFallback: boolean
): HelpArticle {
  const raw = readFileSync(filePath, "utf8")
  const parsed = parseFrontmatter(raw)
  return {
    slug: parsed.slug,
    title: parsed.title,
    category: parsed.category as HelpArticleCategory,
    excerpt: parsed.excerpt,
    body: parsed.body,
    localeFallback,
  }
}

export function toHelpArticleIndex(article: HelpArticle): HelpArticleIndex {
  return {
    slug: article.slug,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    localeFallback: article.localeFallback,
  }
}
