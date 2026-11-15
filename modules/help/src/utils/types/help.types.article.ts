export type HelpArticleCategory =
  | "billing"
  | "storage"
  | "organization"
  | "security"

export type HelpArticleIndex = {
  readonly slug: string
  readonly title: string
  readonly category: HelpArticleCategory
  readonly excerpt: string
  readonly localeFallback: boolean
}

export type HelpArticle = HelpArticleIndex & {
  readonly body: string
}
