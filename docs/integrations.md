# Services & integrations inventory

Living list of every third-party service and first-party system Loftlancer
uses: what it is for, its plan and limits, who owns the account, how it is
connected, and the env var **names** it needs. Never put values here.

Keep this file current: any PR that adds, changes or removes a service updates
its row (see #361).

Last verified: **2026-10-17** (production, loftlancer.com).

## Production verification (2026-10-17)

All six services set up on 2026-10-17 were tested against production after the
deploy that carried their keys (#347):

| Service | Test | Result |
|---|---|---|
| Upstash Redis | write, read back and delete a test key | pass |
| Vercel Blob | upload, read back and delete a test file | pass |
| Sentry | test error sent; event accepted and visible in the `loftlancer` project; browser SDK loads on every page | pass |
| Vercel Web Analytics | enabled in the project; script loads | pass |
| Vercel Speed Insights | script loads; data collecting | pass |
| Resend | domain `mail.loftlancer.com` verified; test email from `noreply@mail.loftlancer.com` delivered to the owner's Gmail Inbox (not Spam) at 09:26 IST | pass |

Notes from setup:

- **Resend** was reconnected: the first Vercel link had expired and never wrote
  the key, so Resend's access to Vercel was removed and linked again, the unused
  key was deleted, and a fresh key was saved. `RESEND_API_KEY` is a
  **send-only** key (it cannot read or manage the Resend account).
- Invite emails go live in production with the release that follows #347,
  because that is the first deploy built with `RESEND_API_KEY` present.

## Inventory

| Name | Category | Purpose / use cases | 1st/3rd | Plan / free limits | Account owner / login | Connection | Env var names | Apps | Status | Dashboard |
|---|---|---|---|---|---|---|---|---|---|---|
| Vercel | hosting | Hosting, deploys, runtime logs, usage | 3rd | Hobby: 100 deploys/day | Jayant, Vercel team jayantrohila (team_kdA2Os0Cq4MnYuLGHn1EyzvS) | Git (GitHub), deploys from `main` only | VERCEL_* (system) | docs, auth, studio | connected | https://vercel.com/jayantrohila/loftlancer |
| Neon | db | Postgres, the authoritative business and usage record | 3rd | Free (branch limit 10) | Jayant | Vercel Marketplace native | DATABASE_URL, DATABASE_URL_POOLED (+ Neon-provided vars) | auth, studio | connected | https://console.neon.tech/app/projects/sweet-glade-82381573 |
| Better Auth | auth | Sessions, orgs, permissions, audit hooks. Passwordless only: GitHub, Google and email magic links; `emailAndPassword` disabled on every instance (#373) | 1st (library) | OSS | n/a | code | BETTER_AUTH_SECRET, BETTER_AUTH_URL | auth, studio | code live | n/a |
| GitHub OAuth | auth | GitHub sign-in | 3rd | Free | Jayant (GitHub jayantrohila57) | manual OAuth app | GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET | auth | connected | https://github.com/settings/developers |
| Google OAuth | auth | "Continue with Google" sign-in and account linking; shown only when both env vars exist. OAuth client **Loftlancer web** (Web application) in GCP project `loftlancer`. Redirect URI `https://loftlancer.com/auth/api/auth/callback/google`. Links to an existing user only when Google reports the email verified (Better Auth defaults, no `trustedProviders`) | 3rd | Free | Jayant (GCP project `loftlancer`) | manual OAuth client | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (Vercel, all envs, sensitive) | auth (+ build flag `NEXT_PUBLIC_GOOGLE_SIGN_IN` in docs/auth/studio) | **connected**, live from v1.9.0 (#359) | https://console.cloud.google.com/apis/credentials?project=loftlancer |
| Magic link sign-in | auth | Passwordless email sign-in (Better Auth `magicLink`, 10-min single-use hashed tokens, built-in rate limit 5/min per IP) sent through the shared `@loftlancer/email` sender with the `MagicLinkEmail` React Email template, so it is recorded by the Mail app hook (#344) | 1st (library) + Resend | uses the Resend quota | n/a | code | RESEND_API_KEY, EMAIL_FROM | auth (+ form on the landing page) | live from v1.9.0 (#373) | n/a |
| Status page | observability | loftlancer.com/status: overall state, per-surface up/down, last check, 30/90-day uptime and recent incidents, cached 60s | 1st | n/a | n/a | code (`apps/auth/src/app/api/status`, `apps/docs/src/app/(split)/status`) | BETTERSTACK_API_TOKEN | auth, docs | live from v1.9.0 (#369) | https://loftlancer.com/status |
| Versioning & changelog | docs | One product version (root `package.json`), `CHANGELOG.md`, `vX.Y.Z` tags, GitHub Releases, `/changelog` timeline and version badge | 1st | n/a | n/a | code + `scripts/release/*` | n/a | docs, studio | live from v1.9.0 (#368) | https://github.com/jayantrohila57/loftlancer/releases |
| Hostinger DNS | DNS | loftlancer.com DNS: Resend SPF/DKIM/DMARC, verification TXT | 3rd | Domain plan | Jayant's own Hostinger account (not the Lucsum one) | manual | n/a | n/a | connected | https://hpanel.hostinger.com |
| Resend | email | Transactional email (invites, system mail) from `noreply@mail.loftlancer.com` | 3rd | Free: 3,000/mo, 100/day | Jayant's existing free account | Vercel Marketplace (linked existing account; reconnected 2026-10-17) | RESEND_API_KEY (send-only key) | auth, studio | **verified in prod**; domain `mail.loftlancer.com` verified (SPF/DKIM/DMARC on Hostinger) | https://resend.com/domains |
| React Email | email | Email templates/UI | 1st (library) | OSS | n/a | code (`packages/email`) | n/a | auth, studio | code live | n/a |
| Sentry | observability | Frontend and backend errors | 3rd | Developer (free): 5k errors/mo | Vercel-native Sentry org `loftlancer` (US region) | Vercel Marketplace native | NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT | docs, auth, studio | **verified in prod** (test event accepted); source maps uploaded on production builds (#364); release `loftlancer@<version>`, server-side user id + `org_id` tags (#354, merged to dev via the v1.10.0 batch PR) | https://loftlancer.sentry.io |
| Upstash Redis | cache | Rate limiting, cache | 3rd | Free: 500k commands/mo | Vercel Marketplace (Jayant) | Vercel Marketplace native (`loftlancer-redis`, Singapore) | KV_REST_API_URL, KV_REST_API_TOKEN (+ KV_*) | auth, studio | **verified in prod**; app code pending | https://console.upstash.com |
| Vercel AI Gateway | AI | Server-side model generation with organization model allowlists, token budgets and immutable usage records | 3rd | Vercel usage based | Vercel team jayantrohila | AI SDK 7 via `packages/api/src/modules/ai` | AI_GATEWAY_API_KEY | studio | code ready in #765; requires migration 0030 and a configured key before generation is enabled | https://vercel.com/ai-gateway |
| Vercel Blob | storage | File uploads (avatars, attachments) | 3rd | Hobby free tier | Vercel team jayantrohila | Vercel native (`loftlancer-blob`, public) | BLOB_READ_WRITE_TOKEN | studio | **verified in prod**; app code pending | https://vercel.com/jayantrohila/~/stores |
| Vercel Web Analytics | analytics | Public site and app page views (cookieless) | 3rd | Hobby free tier | Vercel team jayantrohila | Vercel native (`@vercel/analytics`) | n/a | docs, auth, studio | **enabled**, verified in prod | Vercel project → Analytics |
| Vercel Speed Insights | observability | Core Web Vitals | 3rd | Hobby free tier | Vercel team jayantrohila | Vercel native (`@vercel/speed-insights`) | n/a | docs, auth, studio | **verified in prod** | Vercel project → Speed Insights |
| GitHub | hosting/dev | Repo, issues, Project board, CI | 3rd | Free | jayantrohila57 | n/a | n/a | all | connected | https://github.com/jayantrohila57/loftlancer |
| Audit log (`audit_event` tables) | db/observability | Audit trail for sensitive actions | 1st | n/a | n/a | code | ACTIONS_AUDIT_ENABLED | auth, studio | code live (partial, #357) | Studio activity |
| Analytics consent banner | privacy | Asks once before optional analytics (GA4, PostHog) load; choice in localStorage `ll_analytics_consent` | 1st | n/a | n/a | code (`@loftlancer/ui/patterns/analytics-consent`) | n/a | docs, studio | code live; shows only once GA4 or PostHog is configured | n/a |
| SEO (metadata, sitemap, robots, JSON-LD) | SEO | Canonical URLs, per-page titles, sitemap of public URLs, robots disallow /studio and /auth, noindex on private apps, Organization/WebSite/SoftwareApplication JSON-LD | 1st | n/a | n/a | code (apps/docs) | NEXT_PUBLIC_DOCS_URL (optional, defaults to https://loftlancer.com) | docs (+ noindex in auth, studio) | code live (#352) | https://loftlancer.com/sitemap.xml |
| Mail app (#344) | email | Internal mailbox for all sent mail | 1st | n/a | n/a | code | n/a | mail (3rd app) | todo | n/a |
| Google Cloud project `loftlancer` | auth/analytics/SEO | One Google Cloud project for the OAuth client, GA4 and Search Console | 3rd | Free | Jayant's Google account | manual (console) | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (Vercel, all envs, sensitive) | auth | **connected** | https://console.cloud.google.com/home/dashboard?project=loftlancer |
| Google Search Console | SEO | Indexing, search performance | 3rd | Free | Jayant (GCP project `loftlancer`) | **Domain property** `loftlancer.com`, verified via a DNS TXT record on Hostinger | n/a (DNS verification; GOOGLE_SITE_VERIFICATION meta tag not needed) | docs | **verified**; sitemap https://loftlancer.com/sitemap.xml submitted (83 pages) (#350) | https://search.google.com/search-console?resource_id=sc-domain:loftlancer.com |
| Bing Webmaster Tools | SEO | Bing visibility | 3rd | Free | Jayant | import from GSC, or meta tag | BING_SITE_VERIFICATION (meta tag, code ready) | docs | skipped for now (#350) | https://www.bing.com/webmasters |
| Google Analytics 4 | analytics | Acquisition, conversions; custom events via `sendGAEvent` (`trackEvent` in `apps/docs/src/lib/analytics.ts`) | 3rd | Free | Jayant (GCP project `loftlancer`) | code: official `@next/third-parties/google` `<GoogleAnalytics>`, rendered only after consent and only when the ID is set. Property **559253906**, web stream **16146393845** | NEXT_PUBLIC_GA_MEASUREMENT_ID (Vercel, all envs) | docs (public site only) | **connected**, live from v1.9.0 (#351) | https://analytics.google.com/analytics/web/#/p559253906 |
| PostHog | analytics | Product analytics, funnels, session replay (inputs masked), flags | 3rd | Free: 1M events/mo, 5k replays/mo | Jayant, PostHog US cloud, org **Loftlancer**, project **loftlancer** (id 670026), session replay on | code (env-gated, consent-gated, CDN loader, no npm dependency); withdrawing consent calls `opt_out_capturing` so capture and replay stop without a reload (#353) | NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST (`https://us.i.posthog.com`) (Vercel, all envs) | studio only | **connected**, live from v1.9.0; identify (user id only) + `organization` group, reset on sign-out, core events in `apps/studio/src/lib/posthog.ts` (#353) | https://us.posthog.com/project/670026 |
| Better Stack Uptime | observability | Uptime checks every 3 min and email alerts for 4 monitors (Landing `/`, Docs `/docs`, Studio `/studio`, Auth `/auth`); public status page; API feeds loftlancer.com/status | 3rd | Free (3-min checks) | jrohila55@gmail.com, team t617013 | manual (Better Stack dashboard); read-only Uptime API token **loftlancer-status-readonly**, used server-side only | BETTERSTACK_API_TOKEN (Vercel, all envs, secret; never sent to browsers) | auth (`/auth/api/status`), docs (`/status`) | **connected** (#356); status page live from v1.9.0 (#369); health endpoints `/api/health`, `/auth/api/health`, `/studio/api/health` built (#356), monitors still point at the pages | https://uptime.betterstack.com/team/t617013/monitors · https://loftlancer.betteruptime.com |
| Centralized logs | observability | Searchable logs across apps: `@loftlancer/logger` writes one JSON line per entry (Vercel runtime logs) and forwards to Sentry Logs via `Sentry.logger`. On the Node server, a coalesced `Sentry.flush` (via Vercel `waitUntil`) runs at most once per microtask turn (coalesced) so serverless handlers do not drop buffered logs; the browser relies on the SDK batch timer only. Server: Node `instrumentation.ts` (`@loftlancer/logger/sentry-instrument-server`). Edge: `initSentryEdge` for errors. Browser: `instrumentation-client.ts` in all 3 apps. Docs is a static export, so production logs are browser-only | 3rd | Sentry Developer (free) | Vercel-native Sentry org `loftlancer` | code (`@loftlancer/logger/sentry-instrument`, wired in each app's instrumentation files) | `NEXT_PUBLIC_SENTRY_DSN` on every Vercel project (Production + Preview), used by server and browser; `SENTRY_DSN` is only a server fallback when the public DSN is unset | docs, auth, studio | **live** since v1.10.0 (server logs, #355 / release #387); browser logs from v1.11.0; server flush fix in dev (#355) | https://loftlancer.sentry.io |

## Turning on an env-gated integration

GA4, PostHog and the search-console verification tags are read at **build
time**. Add the variable in Vercel (Production), then let it ride the next
batch push to `main`; do not trigger a separate deploy (Hobby: 100/day).

## Sentry test errors (#354)

Each app has a test-error trigger to confirm that events reach Sentry with a
readable, source-mapped stack trace. Every event is tagged `app`
(`auth` / `studio` / `docs`), `runtime` (`server` / `browser`) and
`test: true`, and carries no user data. Filter in Sentry with `test:true`.

**Auth and studio** are guarded by the server-only `SENTRY_TEST_TOKEN`
(Vercel Production, auth + studio; 32+ random characters, e.g.
`openssl rand -hex 32`). It is read at **runtime**. While it is unset (or
shorter than 32 characters) every trigger answers 404. The token travels only
in the `x-sentry-test-token` header, is compared timing-safely, is scrubbed
from Sentry events (`beforeSend`) and is never logged. All trigger responses,
including the 404s, send `Cache-Control: private, no-store`.

- Server: `curl -i -X POST -H "x-sentry-test-token: $SENTRY_TEST_TOKEN" https://loftlancer.com/auth/api/sentry-test`
  (and `/studio/api/sentry-test`; studio needs no session for this route).
  Answers `500` with `{"ok":true,"eventId":"…"}` once the event is sent.
- Browser: open `https://loftlancer.com/auth/sentry-test` or
  `https://loftlancer.com/studio/sentry-test` (signed in), paste the token and
  click **Throw browser test error**. The page shows the event id.

**Docs** is a static export with no server, so nothing secret can guard it:
`https://loftlancer.com/sentry-test` is a hidden, noindex page that sends one
event per button click. Anyone who finds it can send test events (the public
DSN already allows that), so watch the error quota and remove the page if it
is abused.

Remove `SENTRY_TEST_TOKEN` when testing is done to switch the auth and studio
triggers back to 404.
