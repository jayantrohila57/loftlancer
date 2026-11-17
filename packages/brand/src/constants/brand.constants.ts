/**
 * Loftlancer brand details for apps and packages.
 *
 * Current product copy is from "Loftlancer — Product HQ" (15 Nov 2026),
 * the pivot to a planning, validation and delivery workspace.
 * Visual tokens and asset paths are from the Brand Kits "Loftlancer"
 * page (17 Oct 2026), which Product HQ marks as a legacy identity
 * reference. Domain and mail-domain facts only are taken from the
 * private Loftlancer ops page.
 *
 * Company contact, legal routes, sender addresses, domains, SEO image
 * paths, and logo files were also collected on 16 Nov 2026 from the
 * live site, loftlancer-draft v1.26.5, the current repo, Vercel
 * project domains, Gmail, and public social search. Personal contact
 * details are not included. Do not invent missing values. Keep secrets
 * out of this package.
 *
 * Sources:
 * - https://app.notion.com/p/4195fdc2406481ed9e51c2241a1c7273
 * - https://app.notion.com/p/3fc5fdc240648147b600d9fb4cea6ff1
 * - https://app.notion.com/p/3fc5fdc24064816aab83fe98471aa552
 * - https://app.notion.com/p/3fa5fdc2406481f9b67cf63c41ddbe81
 * - https://loftlancer.com (live, 16 Nov 2026)
 * - https://github.com/jayantrohila57/loftlancer-draft (package.json version 1.26.5 on main)
 * - https://github.com/jayantrohila57/loftlancer
 * - Vercel project domains for loftlancer.com
 * - Gmail messages from Loftlancer transactional mail (15–16 Nov 2026 and 17 Oct 2026)
 */

/** Core identity and current (15 Nov 2026) product positioning. */
export const brand = {
  name: "Loftlancer",
  /**
   * TODO: no Loftlancer legal or registered company name is documented.
   * The v1.26.5 footer copyright line is "© {year} Loftlancer" (product
   * name, not a registered entity). See `brandContact.legalName`.
   */
  legalName: null,
  /**
   * Headline from Product HQ: "Loftlancer — Vibe plan before you vibe code."
   */
  tagline: "Vibe plan before you vibe code.",
  shortDescription:
    "A planning, validation and delivery workspace for freelance software builders.",
  description:
    "Turn vague client ideas into validated, client-approved software plans and keep AI coding agents aligned with what was agreed.",
  longDescription:
    "Loftlancer is a planning, validation and delivery workspace for freelance software builders. It uncovers requirements developers did not know to ask about, translates client intent into explicit scope and agent-ready work, and keeps the plan up to date through implementation and handover.",
  mission:
    "Be the source of truth between client expectations, the freelancer, and implementation — not another coding agent.",
  positioning: {
    statement:
      "Loftlancer is a planning, validation and delivery workspace for freelance software builders.",
    differentiation:
      "This product is not another coding agent. It is the source of truth between client expectations, the freelancer, and implementation.",
    longTermProduct:
      "A freelancer business hub from onboarding and client intake to projects, approvals, documents, delivery and payment.",
  },
  valueProps: [
    {
      stage: "before-coding",
      summary:
        "Discover hidden requirements, clarify trade-offs, expose unknowns and gain client approval.",
    },
    {
      stage: "during-coding",
      summary:
        "Pass task-sized context to Cursor, Claude Code, Codex and other coding agents. Detect potential scope drift and unexpected architectural changes.",
    },
    {
      stage: "after-coding",
      summary:
        "Verify against requirements and acceptance criteria; coordinate changes, approvals and handover.",
    },
  ],
  audience: {
    initial:
      "Independent developers and small software studios building client projects with AI coding tools.",
    longTerm:
      "Freelancers running client work from onboarding and intake through delivery and payment.",
  },
  /**
   * TODO: Product HQ does not document a new voice and tone. The Brand Kit
   * voice belongs to the previous environment-manager positioning; see
   * `brandLegacy.voiceAndTone`.
   */
  voiceAndTone: null,
  plans: {
    free: "free",
    paid: "paid",
  },
  formerlyKnownAs: ["Env Manager", "Collidr"],
} as const

/**
 * Marketing hero copy for the public website home (Product HQ, 15 Nov 2026).
 * Locale-specific translations may override labels; paths stay canonical here.
 */
export const brandHero = {
  badge: "New features shipped!",
  headline: {
    line1: "Turn Client Ideas Into",
    line2: "Plans Your Team Can Ship",
  },
  subhead: {
    line1: "Validate scope with clients before you vibe code.",
    line2: "Keep agents aligned with what was agreed.",
  },
  cta: {
    bookCall: {
      label: "Book a call",
      href: "/contact",
    },
    getStarted: {
      label: "Get started",
    },
  },
  links: {
    whatsNew: "/whats-new",
  },
} as const

/**
 * Production URLs and in-app path mounts.
 *
 * Apex, www (308 to apex), and loftlancer.vercel.app were confirmed on
 * the Vercel project for loftlancer.com on 16 Nov 2026. App path mounts
 * come from Vercel Services / docs and the current checkout.
 *
 * `legal` and `legacyMarketing` are the public routes from
 * loftlancer-draft v1.26.5 (`module/www/utils/utils.www-layout.constants.ts`
 * and legal nav). Those paths 404 on the live rewrite as of 16 Nov 2026
 * and are recorded as documented routes, not as currently live pages.
 * `issues` is the contact channel named on the v1.26.5 /legal/contact page.
 */
export const brandLinks = {
  website: "https://loftlancer.com",
  github: "https://github.com/jayantrohila57/loftlancer",
  issues: "https://github.com/jayantrohila57/loftlancer/issues",
  /**
   * First-party status page on the marketing site. Better Stack fallback JSON:
   * https://loftlancer.betteruptime.com/index.json (page id 267755).
   */
  status: "https://loftlancer.com/status",
  domains: {
    apex: "loftlancer.com",
    www: "www.loftlancer.com",
    vercelApp: "loftlancer.vercel.app",
  },
  paths: {
    web: "/",
    auth: "/auth",
    studio: "/studio",
    console: "/console",
  },
  apps: {
    web: "https://loftlancer.com",
    auth: "https://loftlancer.com/auth",
    studio: "https://loftlancer.com/studio",
    console: "https://loftlancer.com/console",
  },
  legal: {
    privacy: "https://loftlancer.com/privacy",
    terms: "https://loftlancer.com/terms",
    contact: "https://loftlancer.com/legal/contact",
    cookies: "https://loftlancer.com/legal/cookies",
    security: "https://loftlancer.com/legal/security",
    dpa: "https://loftlancer.com/legal/dpa",
    acceptableUse: "https://loftlancer.com/legal/acceptable-use",
    about: "https://loftlancer.com/about",
  },
  legacyMarketing: {
    features: "https://loftlancer.com/features",
    pricing: "https://loftlancer.com/pricing",
    changelog: "https://loftlancer.com/changelog",
    status: "https://loftlancer.com/status",
  },
} as const

/**
 * Loftlancer mail addresses that were actually found.
 *
 * Sending domain: private Loftlancer ops page (non-secret fact) and
 * loftlancer-draft v1.26.5 `packages/resend/src/constants/resend.constants.ts`
 * ("Resend has verified mail.loftlancer.com").
 *
 * `from` / `noreply`: the transactional sender used in production
 * ("Loftlancer <noreply@mail.loftlancer.com>"), confirmed in Gmail
 * (sign-in notices 15–16 Nov 2026 and a 17 Oct 2026 Resend test) and
 * in the same draft Resend constant. This is a sending address, not
 * a support inbox.
 *
 * No support, contact, or hello mailbox was found on the live site,
 * in either repo, in Gmail send-as aliases, or as a Gmail recipient
 * of company mail. Leave those null until mailboxes exist.
 */
export const brandEmails = {
  sendingDomain: "mail.loftlancer.com",
  from: "Loftlancer <noreply@mail.loftlancer.com>",
  noreply: "noreply@mail.loftlancer.com",
  support: "support@loftlancer.com",
  privacy: "privacy@loftlancer.com",
  contact: "support@loftlancer.com",
} as const

/**
 * Legal entity, contact, and document versions for public policies and sign-up consent.
 * Draft copy is pending formal legal review.
 */
export const brandLegal = {
  entityName: "Loftlancer",
  supportEmail: brandEmails.support,
  privacyEmail: brandEmails.privacy,
  termsVersion: "2026-11-17",
  lastUpdatedIso: "2026-11-17",
} as const

/**
 * Public Loftlancer company contact for apps (footer, contact page, legal).
 *
 * A 16 Nov 2026 search of Notion (excluding personal pages), the live
 * loftlancer.com surface, loftlancer-draft v1.26.5 legal/footer/site
 * config, the current repo and local checkout, Gmail, Vercel domains,
 * and public X / LinkedIn / GitHub search found no Loftlancer support
 * inbox, phone, postal address, registered legal entity, GST number,
 * or business hours.
 *
 * The v1.26.5 /legal/contact page directs product support and feature
 * requests to the GitHub issue tracker, and privacy or legal requests
 * to the project owner via the GitHub repository — no email is listed.
 * Live /privacy, /terms, /legal/contact and related routes 404 after
 * the rewrite. Personal contact details and other companies' addresses
 * are not copied here.
 */
export const brandContact = {
  emails: {
    from: "Loftlancer <noreply@mail.loftlancer.com>",
    noreply: "noreply@mail.loftlancer.com",
    support: brandEmails.support,
    privacy: brandEmails.privacy,
    contact: brandEmails.contact,
  },
  /** TODO: no Loftlancer company phone number was found. */
  phone: null,
  /** TODO: no Loftlancer business or postal address was found. */
  address: null,
  /** Product legal name used in policies until a registered entity is documented. */
  legalName: brandLegal.entityName,
  /** TODO: no Loftlancer business hours were found. */
  hours: null,
  /** TODO: no public GST or registration number was found for Loftlancer. */
  gst: null,
  supportChannel: {
    type: "github-issues",
    url: "https://github.com/jayantrohila57/loftlancer/issues",
  },
} as const

/**
 * Current SEO defaults from Product HQ copy. Open Graph image paths
 * and dimensions are from loftlancer-draft v1.26.5
 * (`module/www/utils/utils.seo-metadata.utils.ts` and
 * `.github/brand/og-1200x630.png`). The live site path 404s after the
 * rewrite; the draft-repo file still exists.
 *
 * TODO: no SEO keywords are documented for the 15 Nov 2026
 * planning-workspace positioning. Legacy env-manager keywords are in
 * `brandLegacy.seo.keywords`.
 */
export const brandSeo = {
  title: "Loftlancer — Vibe plan before you vibe code",
  description:
    "Turn vague client ideas into validated, client-approved software plans and keep AI coding agents aligned with what was agreed.",
  canonicalUrl: "https://loftlancer.com",
  siteName: "Loftlancer",
  titleTemplate: "%s | Loftlancer",
  openGraphType: "website",
  openGraphLocale: "en_US",
  keywords: [] as const,
  ogImage: {
    path: ".github/brand/og-1200x630.png",
    sitePath: "/favicon/og-image.png",
    sourceUrl:
      "https://raw.githubusercontent.com/jayantrohila57/loftlancer-draft/main/.github/brand/og-1200x630.png",
    width: 1200,
    height: 630,
    alt: "Loftlancer",
  },
} as const

/**
 * Product social profiles. Public search on 16 Nov 2026 found no
 * Loftlancer X account, LinkedIn company page, or GitHub organization.
 * Only the product repository (and its issue tracker, used as the
 * v1.26.5 support channel) is recorded here. Personal accounts found
 * in some sources were not copied.
 */
export const brandSocial = {
  github: {
    url: "https://github.com/jayantrohila57/loftlancer",
    owner: "jayantrohila57",
    repository: "loftlancer",
    issues: "https://github.com/jayantrohila57/loftlancer/issues",
  },
  /** TODO: no Loftlancer X / Twitter company profile was found. */
  x: null,
  /** TODO: no Loftlancer LinkedIn company page was found. */
  linkedin: null,
} as const

/** Palette from the Brand Kit; hex values match the repo PWA theme token. */
export const brandColors = {
  primary: "#262626",
  primaryForeground: "#fafafa",
  backgroundLight: "#ffffff",
  backgroundDark: "#161616",
  foregroundDark: "#f5f5f5",
  ring: "#a3a3a3",
  mutedForeground: "#737373",
  info: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  destructive: "#ef4444",
  tokens: {
    primary: "--primary",
    primaryForeground: "--primary-foreground",
    background: "--background",
    foreground: "--foreground",
    ring: "--ring",
    mutedForeground: "--muted-foreground",
    info: "--info",
    success: "--success",
    warning: "--warning",
    destructive: "--destructive",
  },
} as const

/**
 * UI typography as implemented in the repo (`features/font` → `next/font/local`).
 * Running sans: Instrument Sans (OFL, variable). Brand Kit Inter is legacy only.
 */
export const brandTypography = {
  ui: "Instrument Sans",
  code: "Geist Mono",
  iconStyle: {
    library: "lucide-react",
    strokeWidthPx: 2,
    caps: "round",
    joins: "round",
    color: "currentColor",
  },
} as const

/**
 * Official mark from the Brand Kit. Asset paths exist in
 * jayantrohila57/loftlancer-draft v1.26.5 under `.github/brand/` and
 * also as `apps/www/public/favicon/og-image.png` (same 1200×630 file).
 * They are not in this checkout or in jayantrohila57/loftlancer, and
 * https://loftlancer.com/favicon/og-image.png 404s after the rewrite.
 * Live https://loftlancer.com/favicon.ico returned 200 on 16 Nov 2026
 * (current rewrite favicon, not confirmed as the Brand Kit mark).
 *
 * The earlier house/loft `LoftlancerMark` was rejected on 17 Oct 2026.
 */
export const brandLogo = {
  markIcon: "Layers",
  markLibrary: "lucide-react",
  markForeground: "#ffffff",
  markBackground: "#262626",
  markCornerRadiusPercent: 22,
  wordmarkWeight: "Bold",
  /**
   * TODO: Brand Kit wordmark is specified in Inter Bold; logo files are
   * not in this checkout, and the running UI font is Instrument Sans.
   */
  wordmarkFont: null,
  assets: {
    logoMarkSvg: ".github/brand/logo-mark.svg",
    logoMarkPng: ".github/brand/logo-mark.png",
    wordmarkDarkSvg: ".github/brand/wordmark-dark.svg",
    wordmarkLightSvg: ".github/brand/wordmark-light.svg",
    lockupOnLight: ".github/brand/logo-lockup-on-light.png",
    lockupOnDark: ".github/brand/logo-lockup-on-dark.png",
    icon512: ".github/brand/icon-512.png",
    icon192: ".github/brand/icon-192.png",
    favicon32: ".github/brand/icon-32.png",
    og1200x630: ".github/brand/og-1200x630.png",
    githubSocial1280x640: ".github/brand/github-social-1280x640.png",
    readmeBanner: ".github/brand/readme-banner.png",
    socialBanner1500x500: ".github/brand/social-banner-1500x500.png",
    palette: ".github/brand/palette.png",
  },
  draftRepo: "https://github.com/jayantrohila57/loftlancer-draft",
  assetsInDraftRepo: true,
  /** TODO: copy `.github/brand/` from loftlancer-draft into this repo. */
  assetsInRepo: false,
} as const

/**
 * Pre-pivot identity (environment and secrets manager), kept as reference
 * only. Product HQ (15 Nov 2026) says this must not be treated as current
 * positioning.
 */
export const brandLegacy = {
  product: "An environment and secrets manager for teams.",
  tagline:
    "Organizations, projects, environments and encrypted variables for your team and your agents.",
  oneLiner:
    "Organizations, projects, environments and encrypted variables for your team and your agents.",
  shortDescription: "An environment and secrets manager for teams.",
  mediumDescription:
    "Loftlancer is an environment and secrets manager for teams. Store environment variables across organizations, projects and environments (dev, staging, production), with values encrypted at rest, role-based access and an audit timeline.",
  longDescription:
    "Loftlancer is an environment and secrets manager for teams. You organize environment variables by organization, project and environment (dev, staging, production). Values are encrypted at rest with AES-256-GCM. Access follows org roles (Owner, Manager, Member) with per-project grants checked on every request, and an audit timeline, notifications and soft deletes are built in. Sign-in is passwordless (GitHub, Google when configured, or an email magic link). It runs at loftlancer.com as three Next.js apps on one Vercel project: the landing page and docs at /, auth at /auth and the product Studio at /studio.",
  mission:
    "Give teams, and the agents working with them, one organized and encrypted place for every environment's variables.",
  voiceAndTone:
    "Calm, precise and security-minded. Say exactly what is encrypted and who can see it. Short sentences, no fear-selling.",
  typographyUi: "Inter",
  seo: {
    title: "Loftlancer: organizations, projects and encrypted environments",
    description:
      "Organizations, projects, environments and encrypted variables for your team and your agents.",
    keywords: [
      "environment variables manager",
      "secrets manager",
      "env manager",
      "encrypted environment variables",
      "team secrets",
      "dotenv alternative",
      "nextjs",
      "role-based access",
      "environment variables",
      "secrets management",
      "devops",
      "ci/cd",
      "developer tools",
      "configuration management",
      "security",
      "env files",
    ],
  },
  /** loftlancer-draft v1.26.5 marketing.site-config / www site-config. */
  siteConfig: {
    tagline: "Projects, people, and access.",
    description:
      "A shared workspace for teams to organize projects, manage access, and handle encrypted environment variables and project tasks.",
  },
} as const
