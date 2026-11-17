export const WEB_HELP_CATEGORIES = [
  "gettingStarted",
  "accountSignIn",
  "organizationsRoles",
  "billingPlans",
  "privacyData",
  "troubleshooting",
] as const

export type WebHelpCategoryId = (typeof WEB_HELP_CATEGORIES)[number]

export const WEB_HELP_ARTICLE_SLUGS = [
  "what-is-loftlancer",
  "create-your-account",
  "passwordless-sign-in",
  "switch-locale",
  "create-organization",
  "invite-teammates",
  "organization-roles",
  "free-vs-paid-plans",
  "subscribe-and-billing",
  "cancel-or-change-plan",
  "cookie-and-analytics-consent",
  "export-or-delete-data",
  "magic-link-not-arriving",
  "billing-checkout-issues",
  "contact-support",
] as const

export type WebHelpArticleSlug = (typeof WEB_HELP_ARTICLE_SLUGS)[number]

export type WebHelpArticleMeta = {
  readonly category: WebHelpCategoryId
  readonly slug: WebHelpArticleSlug
}

export const WEB_HELP_ARTICLES: readonly WebHelpArticleMeta[] = [
  { slug: "what-is-loftlancer", category: "gettingStarted" },
  { slug: "create-your-account", category: "gettingStarted" },
  { slug: "passwordless-sign-in", category: "accountSignIn" },
  { slug: "switch-locale", category: "accountSignIn" },
  { slug: "create-organization", category: "organizationsRoles" },
  { slug: "invite-teammates", category: "organizationsRoles" },
  { slug: "organization-roles", category: "organizationsRoles" },
  { slug: "free-vs-paid-plans", category: "billingPlans" },
  { slug: "subscribe-and-billing", category: "billingPlans" },
  { slug: "cancel-or-change-plan", category: "billingPlans" },
  { slug: "cookie-and-analytics-consent", category: "privacyData" },
  { slug: "export-or-delete-data", category: "privacyData" },
  { slug: "magic-link-not-arriving", category: "troubleshooting" },
  { slug: "billing-checkout-issues", category: "troubleshooting" },
  { slug: "contact-support", category: "troubleshooting" },
]

export function getWebHelpArticle(
  slug: string
): WebHelpArticleMeta | undefined {
  return WEB_HELP_ARTICLES.find((article) => article.slug === slug)
}

export function getWebHelpArticlesByCategory(
  category: WebHelpCategoryId
): readonly WebHelpArticleMeta[] {
  return WEB_HELP_ARTICLES.filter((article) => article.category === category)
}
