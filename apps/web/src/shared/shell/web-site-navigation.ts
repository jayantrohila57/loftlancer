import type {
  NavigationItem,
  NavigationPlacement,
  NavigationRegistry,
} from "@features/navigation"
import { createNavigationRegistry } from "@features/navigation"

export type WebSiteNavGroup = "company" | "legal" | "product" | "resources"

export type WebSiteLegalSubGroup = "compliance" | "policies"

export const WEB_SITE_NAV_GROUP_HEADING_KEYS = {
  company: "navGroupCompany",
  legal: "navGroupLegal",
  product: "navGroupProduct",
  resources: "navGroupResources",
} as const satisfies Record<WebSiteNavGroup, string>

export const WEB_SITE_FOOTER_LEGAL_SUB_GROUP_HEADING_KEYS = {
  compliance: "navGroupLegalMore",
  policies: "navGroupLegalPolicies",
} as const satisfies Record<WebSiteLegalSubGroup, string>

export type WebSiteFooterNavColumn =
  | {
      readonly group: Exclude<WebSiteNavGroup, "legal">
      readonly kind: "group"
    }
  | { readonly kind: "legal"; readonly legalSubGroup: WebSiteLegalSubGroup }

/** Footer link columns (product, company, resources, legal ×2). */
export const WEB_SITE_FOOTER_NAV_COLUMNS: readonly WebSiteFooterNavColumn[] = [
  { group: "product", kind: "group" },
  { group: "company", kind: "group" },
  { group: "resources", kind: "group" },
  { kind: "legal", legalSubGroup: "policies" },
  { kind: "legal", legalSubGroup: "compliance" },
]

/** Desktop header mega-menu triggers (excludes standalone Home and Legal). */
export const WEB_SITE_HEADER_DROPDOWN_GROUPS: readonly WebSiteNavGroup[] = [
  "product",
  "company",
  "resources",
]

/** Groups rendered in footer columns and mobile nav sections. */
export const WEB_SITE_SURFACE_NAV_GROUPS: readonly WebSiteNavGroup[] = [
  "product",
  "company",
  "resources",
  "legal",
]

export type WebSiteNavLabelKey =
  | "navAbout"
  | "navAccessibility"
  | "navBlog"
  | "navContact"
  | "navCustomerStories"
  | "navFaq"
  | "navHelpCenter"
  | "navHome"
  | "navLegalAcceptableUse"
  | "navLegalCookies"
  | "navLegalDisclaimer"
  | "navLegalLicenses"
  | "navLegalOverview"
  | "navLegalPrivacy"
  | "navLegalRefund"
  | "navLegalTerms"
  | "navPartnerships"
  | "navPricing"
  | "navProductApi"
  | "navProductClientValidation"
  | "navProductIntegrations"
  | "navProductPlanning"
  | "navProductScopeInsights"
  | "navProductTeamCollaboration"
  | "navLegalSecurity"
  | "navLegalSubprocessors"
  | "navSearch"
  | "navSitemap"

export type WebSiteNavDescriptionKey =
  | "navDescAbout"
  | "navDescAccessibility"
  | "navDescBlog"
  | "navDescContact"
  | "navDescCustomerStories"
  | "navDescFaq"
  | "navDescHelpCenter"
  | "navDescHome"
  | "navDescLegalAcceptableUse"
  | "navDescLegalCookies"
  | "navDescLegalDisclaimer"
  | "navDescLegalLicenses"
  | "navDescLegalOverview"
  | "navDescLegalPrivacy"
  | "navDescLegalRefund"
  | "navDescLegalTerms"
  | "navDescPartnerships"
  | "navDescPricing"
  | "navDescProductApi"
  | "navDescProductClientValidation"
  | "navDescProductIntegrations"
  | "navDescProductPlanning"
  | "navDescProductScopeInsights"
  | "navDescProductTeamCollaboration"
  | "navDescLegalSecurity"
  | "navDescLegalSubprocessors"
  | "navDescSearch"
  | "navDescSitemap"

/** Lucide icon import names used in desktop nav cards. */
export type WebSiteNavIconName =
  | "accessibility"
  | "badge-check"
  | "bar-chart-3"
  | "circle-question-mark"
  | "code"
  | "cookie"
  | "credit-card"
  | "file-text"
  | "globe"
  | "handshake"
  | "help-circle"
  | "house"
  | "layers"
  | "leaf"
  | "mail"
  | "map"
  | "plug"
  | "rotate-ccw"
  | "scale"
  | "scroll-text"
  | "search"
  | "shield"
  | "star"
  | "triangle-alert"
  | "user-plus"
  | "users"

export type WebSiteNavHref =
  | "/"
  | "/about"
  | "/accessibility"
  | "/blog"
  | "/company/customer-stories"
  | "/company/partnerships"
  | "/contact"
  | "/faq"
  | "/help"
  | "/legal/acceptable-use"
  | "/legal/cookies"
  | "/legal/disclaimer"
  | "/legal/licenses"
  | "/legal/overview"
  | "/legal/privacy"
  | "/legal/refund"
  | "/legal/terms"
  | "/pricing"
  | "/product/api"
  | "/product/client-validation"
  | "/product/integrations"
  | "/product/planning-workspace"
  | "/product/scope-insights"
  | "/product/team-collaboration"
  | "/legal/security"
  | "/legal/subprocessors"
  | "/search"
  | "/sitemap"

export type WebSiteNavItemSpec = {
  readonly descriptionKey?: WebSiteNavDescriptionKey
  readonly group: WebSiteNavGroup
  readonly headerPresentation?: "dropdown" | "standalone"
  readonly href: WebSiteNavHref
  readonly icon?: WebSiteNavIconName
  readonly id: string
  readonly keywords?: readonly string[]
  readonly labelKey: WebSiteNavLabelKey
  readonly legalSubGroup?: WebSiteLegalSubGroup
  readonly order: number
}

const WEB_SITE_NAV_GROUP_IDS = {
  company: "site-company",
  legal: "site-legal",
  product: "site-product",
  resources: "site-resources",
} as const

export const webSiteNavItemSpecs: readonly WebSiteNavItemSpec[] = [
  {
    descriptionKey: "navDescHome",
    group: "resources",
    headerPresentation: "standalone",
    href: "/",
    icon: "house",
    id: "site.home",
    keywords: ["home", "landing", "start"],
    labelKey: "navHome",
    order: 0,
  },
  {
    descriptionKey: "navDescProductPlanning",
    group: "product",
    href: "/product/planning-workspace",
    icon: "layers",
    id: "site.product.planning",
    keywords: ["planning", "scope", "requirements", "milestones"],
    labelKey: "navProductPlanning",
    order: 0,
  },
  {
    descriptionKey: "navDescProductClientValidation",
    group: "product",
    href: "/product/client-validation",
    icon: "badge-check",
    id: "site.product.client-validation",
    keywords: ["validation", "client", "approval", "sign-off"],
    labelKey: "navProductClientValidation",
    order: 1,
  },
  {
    descriptionKey: "navDescProductTeamCollaboration",
    group: "product",
    href: "/product/team-collaboration",
    icon: "user-plus",
    id: "site.product.team-collaboration",
    keywords: ["team", "collaboration", "workspace", "invite"],
    labelKey: "navProductTeamCollaboration",
    order: 2,
  },
  {
    descriptionKey: "navDescProductScopeInsights",
    group: "product",
    href: "/product/scope-insights",
    icon: "bar-chart-3",
    id: "site.product.scope-insights",
    keywords: ["scope", "drift", "insights", "delivery"],
    labelKey: "navProductScopeInsights",
    order: 3,
  },
  {
    descriptionKey: "navDescProductIntegrations",
    group: "product",
    href: "/product/integrations",
    icon: "plug",
    id: "site.product.integrations",
    keywords: ["integrations", "connectors", "apps", "plugins"],
    labelKey: "navProductIntegrations",
    order: 4,
  },
  {
    descriptionKey: "navDescProductApi",
    group: "product",
    href: "/product/api",
    icon: "code",
    id: "site.product.api",
    keywords: ["api", "developers", "sdk", "rest"],
    labelKey: "navProductApi",
    order: 5,
  },
  {
    descriptionKey: "navDescPricing",
    group: "product",
    headerPresentation: "standalone",
    href: "/pricing",
    icon: "credit-card",
    id: "site.pricing",
    keywords: ["pricing", "plans", "subscribe", "billing", "paid"],
    labelKey: "navPricing",
    order: 6,
  },
  {
    descriptionKey: "navDescAbout",
    group: "company",
    href: "/about",
    icon: "users",
    id: "site.about",
    keywords: ["about", "company", "team", "us"],
    labelKey: "navAbout",
    order: 0,
  },
  {
    descriptionKey: "navDescCustomerStories",
    group: "company",
    href: "/company/customer-stories",
    icon: "star",
    id: "site.company.customer-stories",
    keywords: ["customers", "stories", "case studies", "testimonials"],
    labelKey: "navCustomerStories",
    order: 1,
  },
  {
    descriptionKey: "navDescPartnerships",
    group: "company",
    href: "/company/partnerships",
    icon: "handshake",
    id: "site.company.partnerships",
    keywords: ["partnerships", "partners", "alliances"],
    labelKey: "navPartnerships",
    order: 2,
  },
  {
    descriptionKey: "navDescBlog",
    group: "resources",
    href: "/blog",
    icon: "leaf",
    id: "site.resources.blog",
    keywords: ["blog", "news", "articles", "updates"],
    labelKey: "navBlog",
    order: 1,
  },
  {
    descriptionKey: "navDescHelpCenter",
    group: "resources",
    href: "/help",
    icon: "help-circle",
    id: "site.resources.help",
    keywords: ["help", "support", "docs", "center"],
    labelKey: "navHelpCenter",
    order: 2,
  },
  {
    descriptionKey: "navDescFaq",
    group: "resources",
    href: "/faq",
    icon: "circle-question-mark",
    id: "site.resources.faq",
    keywords: ["faq", "questions", "answers"],
    labelKey: "navFaq",
    order: 3,
  },
  {
    descriptionKey: "navDescContact",
    group: "resources",
    href: "/contact",
    icon: "mail",
    id: "site.resources.contact",
    keywords: ["contact", "email", "support", "feedback"],
    labelKey: "navContact",
    order: 4,
  },
  {
    descriptionKey: "navDescSearch",
    group: "resources",
    href: "/search",
    icon: "search",
    id: "site.resources.search",
    keywords: [
      "search",
      "find",
      "command",
      "palette",
      "cmdk",
      "⌘k",
      "control k",
    ],
    labelKey: "navSearch",
    order: 5,
  },
  {
    descriptionKey: "navDescSitemap",
    group: "resources",
    href: "/sitemap",
    icon: "map",
    id: "site.resources.sitemap",
    keywords: ["sitemap", "pages", "index", "map"],
    labelKey: "navSitemap",
    order: 6,
  },
  {
    descriptionKey: "navDescLegalOverview",
    group: "legal",
    href: "/legal/overview",
    icon: "scale",
    id: "site.legal.overview",
    keywords: ["legal", "policies", "overview"],
    labelKey: "navLegalOverview",
    legalSubGroup: "policies",
    order: 0,
  },
  {
    descriptionKey: "navDescLegalTerms",
    group: "legal",
    href: "/legal/terms",
    icon: "file-text",
    id: "site.legal.terms",
    keywords: ["terms", "tos", "service agreement", "legal"],
    labelKey: "navLegalTerms",
    legalSubGroup: "policies",
    order: 1,
  },
  {
    descriptionKey: "navDescLegalPrivacy",
    group: "legal",
    href: "/legal/privacy",
    icon: "shield",
    id: "site.legal.privacy",
    keywords: ["privacy", "data", "gdpr", "personal information"],
    labelKey: "navLegalPrivacy",
    legalSubGroup: "policies",
    order: 2,
  },
  {
    descriptionKey: "navDescLegalRefund",
    group: "legal",
    href: "/legal/refund",
    icon: "rotate-ccw",
    id: "site.legal.refund",
    keywords: ["refund", "billing", "policy"],
    labelKey: "navLegalRefund",
    legalSubGroup: "policies",
    order: 3,
  },
  {
    descriptionKey: "navDescLegalCookies",
    group: "legal",
    href: "/legal/cookies",
    icon: "cookie",
    id: "site.legal.cookies",
    keywords: ["cookies", "tracking", "consent"],
    labelKey: "navLegalCookies",
    legalSubGroup: "policies",
    order: 4,
  },
  {
    descriptionKey: "navDescLegalAcceptableUse",
    group: "legal",
    href: "/legal/acceptable-use",
    icon: "scroll-text",
    id: "site.legal.acceptable-use",
    keywords: ["acceptable use", "aup", "conduct", "policy"],
    labelKey: "navLegalAcceptableUse",
    legalSubGroup: "compliance",
    order: 5,
  },
  {
    descriptionKey: "navDescLegalDisclaimer",
    group: "legal",
    href: "/legal/disclaimer",
    icon: "triangle-alert",
    id: "site.legal.disclaimer",
    keywords: ["disclaimer", "liability", "warranty"],
    labelKey: "navLegalDisclaimer",
    legalSubGroup: "compliance",
    order: 6,
  },
  {
    descriptionKey: "navDescLegalSubprocessors",
    group: "legal",
    href: "/legal/subprocessors",
    icon: "layers",
    id: "site.legal.subprocessors",
    keywords: ["subprocessors", "processors", "vendors", "dpa"],
    labelKey: "navLegalSubprocessors",
    legalSubGroup: "compliance",
    order: 7,
  },
  {
    descriptionKey: "navDescLegalSecurity",
    group: "legal",
    href: "/legal/security",
    icon: "shield",
    id: "site.legal.security",
    keywords: ["security", "disclosure", "vulnerability", "responsible"],
    labelKey: "navLegalSecurity",
    legalSubGroup: "compliance",
    order: 8,
  },
  {
    descriptionKey: "navDescLegalLicenses",
    group: "legal",
    href: "/legal/licenses",
    icon: "badge-check",
    id: "site.legal.licenses",
    keywords: ["licenses", "open source", "copyright", "attribution"],
    labelKey: "navLegalLicenses",
    legalSubGroup: "compliance",
    order: 9,
  },
  {
    descriptionKey: "navDescAccessibility",
    group: "legal",
    href: "/accessibility",
    icon: "accessibility",
    id: "site.legal.accessibility",
    keywords: ["accessibility", "a11y", "wcag", "inclusive"],
    labelKey: "navAccessibility",
    legalSubGroup: "compliance",
    order: 10,
  },
]

export type WebSiteNavTranslate = (key: WebSiteNavLabelKey) => string

export interface DefineWebSiteNavigationItemsInput {
  readonly groupLabels: {
    readonly company: string
    readonly legal: string
    readonly product: string
    readonly resources: string
  }
}

function placementsForGroup(
  group: WebSiteNavGroup
): readonly NavigationPlacement[] {
  if (group === "legal") {
    return ["command"]
  }

  return ["command", "header"]
}

export function getWebSiteNavItemSpecsByGroup(
  group: WebSiteNavGroup
): readonly WebSiteNavItemSpec[] {
  return webSiteNavItemSpecs
    .filter((spec) => spec.group === group)
    .sort((left, right) => left.order - right.order)
}

export function getWebSiteNavItemSpecsForHeaderDropdown(
  group: WebSiteNavGroup
): readonly WebSiteNavItemSpec[] {
  return getWebSiteNavItemSpecsByGroup(group).filter(
    (item) => item.headerPresentation !== "standalone"
  )
}

export function getWebSiteNavItemSpecsForHeaderStandalone(): readonly WebSiteNavItemSpec[] {
  return webSiteNavItemSpecs
    .filter((spec) => spec.headerPresentation === "standalone")
    .sort((left, right) => left.order - right.order)
}

export function getWebSiteNavItemSpecsForFooterGroup(
  group: WebSiteNavGroup
): readonly WebSiteNavItemSpec[] {
  return getWebSiteNavItemSpecsByGroup(group).filter(
    (item) => item.id !== "site.home"
  )
}

export function getWebSiteNavItemSpecsForMobileGroup(
  group: WebSiteNavGroup
): readonly WebSiteNavItemSpec[] {
  return getWebSiteNavItemSpecsForFooterGroup(group)
}

export function getWebSiteNavItemSpecsForFooterColumn(
  column: WebSiteFooterNavColumn
): readonly WebSiteNavItemSpec[] {
  if (column.kind === "group") {
    return getWebSiteNavItemSpecsForFooterGroup(column.group)
  }

  return webSiteNavItemSpecs
    .filter(
      (spec) =>
        spec.group === "legal" && spec.legalSubGroup === column.legalSubGroup
    )
    .sort((left, right) => left.order - right.order)
}

export function getWebSiteFooterNavColumnHeadingKey(
  column: WebSiteFooterNavColumn
): string {
  if (column.kind === "group") {
    return WEB_SITE_NAV_GROUP_HEADING_KEYS[column.group]
  }

  return WEB_SITE_FOOTER_LEGAL_SUB_GROUP_HEADING_KEYS[column.legalSubGroup]
}

export function getWebSiteNavItemSpecsForHeader(): readonly WebSiteNavItemSpec[] {
  return WEB_SITE_HEADER_DROPDOWN_GROUPS.flatMap((group) =>
    getWebSiteNavItemSpecsForHeaderDropdown(group)
  )
}

export function getWebSiteNavItemSpecById(
  id: string
): WebSiteNavItemSpec | undefined {
  return webSiteNavItemSpecs.find((spec) => spec.id === id)
}

export function defineWebSiteNavigationItems(
  translate: WebSiteNavTranslate,
  input: DefineWebSiteNavigationItemsInput
): readonly NavigationItem[] {
  return webSiteNavItemSpecs.map((spec) => ({
    groupId: WEB_SITE_NAV_GROUP_IDS[spec.group],
    groupLabel: input.groupLabels[spec.group],
    href: spec.href,
    id: spec.id,
    keywords: [...(spec.keywords ?? []), translate(spec.labelKey)],
    label: translate(spec.labelKey),
    order: spec.order,
    placements: placementsForGroup(spec.group),
  }))
}

export function createWebSiteNavigationRegistry(
  translate: WebSiteNavTranslate,
  input: DefineWebSiteNavigationItemsInput
): NavigationRegistry {
  return createNavigationRegistry({
    items: defineWebSiteNavigationItems(translate, input),
  })
}

export function isWebSiteNavItemActive(
  pathname: string,
  href: WebSiteNavHref
): boolean {
  if (href === "/") {
    return pathname === "/" || pathname === ""
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
