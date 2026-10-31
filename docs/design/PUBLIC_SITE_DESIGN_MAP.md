# Public site design map

Issue: [#893](https://github.com/jayantrohila57/loftlancer/issues/893)

## Reference research

Efferd's public site, registry pages, and block source bundled in the public route loaded during research. I extracted the published source for the chosen hero, features, pricing, FAQ, CTA, footer, and header blocks before adapting their structures.

- [`/blocks/header`](https://efferd.com/blocks/header): header 1 source (sticky/blur header with responsive mobile navigation).
- [`/blocks/hero`](https://efferd.com/blocks/hero): hero 3 source (left-aligned copy with a dashboard screenshot).
- [`/blocks/features`](https://efferd.com/blocks/features): features 1 source (compact icon-led feature list with dividing rules).
- [`/blocks/integrations`](https://efferd.com/blocks/integrations): integrations 3/4 (split text and logo field). Loftlancer's section stays factual and does not present unavailable product integrations as supported.
- [`/blocks/pricing`](https://efferd.com/blocks/pricing): pricing 2 source (price and feature list arranged with full-width dividers). Adapted to one current early-access offer, since billing and paid plans do not exist.
- [`/blocks/faqs`](https://efferd.com/blocks/faqs): FAQ 2 source and FAQ section, using a split heading and accordion list.
- [`/blocks/cta`](https://efferd.com/blocks/cta): CTA 1 source (short heading and direct action in a divided row).
- [`/blocks/footer`](https://efferd.com/blocks/footer): footer 2 source (brand column and grouped resource/company links).

The source confirms the underlying layouts and composition; the original component code was not copied into the app. The content and interactive primitives are adapted to Loftlancer and coss UI.

## Composition mapping

| Page | Section | Efferd reference | coss UI | Shared implementation |
| --- | --- | --- | --- | --- |
| Home | Header / mobile nav | Header 1, 2 | Button, Menu, MenuLinkItem | `MarketingSiteHeader` |
| Home | Hero and real product preview | Hero 3 | Button | `MarketingLanding` + `ProductPreview` (`studio-overview.jpg`) |
| Home | Capability index | Features 1 | — | Numbered editorial rows in `CapabilitySection` |
| Home | Workspace and access stories | Features 6 | — | `FeatureShowcase` + `ProductPreview` with Studio screenshots |
| Home | Team setup | Features 1 | — | Ruled three-step list in `CollaborationSection` |
| Home | Sign-in and integrations | Integrations 3/4 | — | `ConnectionsSection`, available methods separated from planned integrations |
| Home | Early-access price | Pricing 2 | Button | `$0` offer row in `HomePricingSection` |
| Home | FAQ | FAQs 2/3 | Accordion | `FAQSection` |
| Home | Final action / footer | CTA 1/2, Footer 2/7 | Button | `CallToAction`, `MarketingSiteFooter` |
| Features | Capabilities, project apps, and access | Features 1, 6 | — | Editorial lists from `marketingFeatures` and the app registry; product preview for access |
| Pricing | Current offer and questions | Pricing 2, FAQs 2/3 | Button, Accordion | Single early-access offer, included-feature rows, `FAQSection` |
| About | Mission and product principles | Features 1, CTA 2 | Button | Narrative intro, numbered principles, docs/GitHub actions |
| Changelog | Release history | Features 1 (divided rows) | — | Server-rendered date/version rail with grouped release notes |
| Status | Service state and monitor rows | Features 3 | Badge, Tooltip, Skeleton, Button | `StatusBoard` with unboxed rows and fixed loading slots |
| Privacy, terms | Long-form policy content | FAQ 2 / split content rhythm | — | `MarketingPage` with shared policy index |
| Contact, security, cookies, DPA, acceptable use | Short policies and support information | FAQ 2 / split content rhythm | — | `LegalPage`, owner-review status, shared policy index |
| Docs entry and article routes | Docs header + reading column/sidebar | Header 1, 2 | Button, Menu; Fumadocs navigation slot | `DocsMarketingHeader` uses `MarketingSiteHeader`; docs tree stays in the sidebar |
| Not-found / error | Clear status, focused recovery action | Not Found gallery | Button | `MarketingPageShell` + `MarketingRouteState` |
| Auth sign-in, consent, device, account | Separate task-focused flow | Auth gallery (layout reference only) | Existing coss sign-in and form components | Existing Auth patterns and route layouts; behavior preserved |

## Public route inventory

- Marketing: `/`, `/features`, `/pricing`, `/about`, `/status`, `/changelog`.
- Legal/support: `/privacy`, `/terms`, `/legal/contact`, `/legal/security`, `/legal/cookies`, `/legal/dpa`, `/legal/acceptable-use`.
- Documentation: `/docs` and nested Fumadocs routes.
- Route states: docs app `not-found` and `error` boundaries.
- Authentication entry and flows: `/auth`, consent, device approval, and account settings. They retain their focused auth layout.

`apps/www` is a legacy app and is not configured as a Vercel service in the current root `vercel.json`; deployed public routes are served by `apps/docs` and `apps/auth`.

## Shared visual system

- `MarketingSiteHeader` and `MarketingSiteFooter` define the same navigation and brand treatment across the landing page and public routes. Docs keeps the Fumadocs tree while the shared header spans the full viewport; the mobile menu also opens the docs navigation, and the article column expands to the phone width.
- `PageHero` gives secondary pages a consistent editorial title, category line, and summary. Page bodies use full-width rules, readable measures, and page-specific composition instead of a repeated card grid.
- coss UI remains the interaction layer: shared coss `Button`, `Menu`, `MenuLinkItem`, `Accordion`, `Badge`, `Skeleton`, and `Tooltip` wrappers are reused. Marketing layouts are structural React compositions, not replacements for coss primitives.
- Product visuals are the existing Studio screenshots under `apps/docs/public` and `apps/www/public`; no fabricated product screens or unsupported integrations are presented.
