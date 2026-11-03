# Services & integrations inventory

What Loftlancer uses, why, and which **env var names** it needs (never put values here).

Update this file when a PR adds, changes, or removes a service (#361).

Last verified: **2026-10-17** (production, loftlancer.com).

## Production verification (2026-10-17)

Smoke-tested after deploy #347:

| Service               | Result                          |
| --------------------- | ------------------------------- |
| Upstash Redis         | pass                            |
| Vercel Blob           | pass                            |
| Sentry                | pass                            |
| Vercel Web Analytics  | pass                            |
| Vercel Speed Insights | pass                            |
| Resend                | pass (delivered to owner inbox) |

**Resend:** Marketplace reconnect 2026-10-17; `RESEND_API_KEY` is send-only. Invite mail ships with the first production build that includes the key (#347).

## Inventory

| Service                                                                                                | Purpose                                                                | Env vars                                                                                    | Status                    |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| [Vercel](https://vercel.com/jayantrohila/loftlancer)                                                   | Hosting; deploys from `main` only                                      | `VERCEL_*` (system)                                                                         | connected                 |
| [Neon](https://console.neon.tech/app/projects/sweet-glade-82381573)                                    | Postgres                                                               | `DATABASE_URL`, `DATABASE_URL_POOLED`                                                       | connected                 |
| Better Auth                                                                                            | Sessions, orgs, permissions; passwordless (GitHub, Google, magic link) | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`                                                     | live                      |
| GitHub OAuth                                                                                           | GitHub sign-in                                                         | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`                                                  | connected                 |
| Google OAuth                                                                                           | Google sign-in / linking                                               | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                                  | live (#359)               |
| Magic link                                                                                             | Email sign-in via Resend + `@loftlancer/resend`                        | `RESEND_API_KEY`, `EMAIL_FROM`                                                              | live (#373)               |
| [Resend](https://resend.com/domains)                                                                   | Transactional mail (`noreply@mail.loftlancer.com`)                     | `RESEND_API_KEY`                                                                            | verified in prod          |
| React Email                                                                                            | Email templates                                                        | —                                                                                           | live                      |
| [Sentry](https://loftlancer.sentry.io)                                                                 | Errors, logs, source maps                                              | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | verified in prod          |
| [Upstash Redis](https://console.upstash.com)                                                           | Rate limit / cache                                                     | `KV_REST_API_URL`, `KV_REST_API_TOKEN`                                                      | verified; app use pending |
| Vercel AI Gateway                                                                                      | Org-scoped AI generation (#765)                                        | `AI_GATEWAY_API_KEY`                                                                        | needs migration + key     |
| Vercel Blob                                                                                            | Private file uploads (#766)                                            | `BLOB_READ_WRITE_TOKEN`                                                                     | needs migration + store   |
| Vercel Web Analytics                                                                                   | Page views (cookieless)                                                | —                                                                                           | enabled                   |
| Vercel Speed Insights                                                                                  | Core Web Vitals                                                        | —                                                                                           | enabled                   |
| [GitHub](https://github.com/jayantrohila57/loftlancer)                                                 | Repo, issues, CI                                                       | —                                                                                           | connected                 |
| Hostinger DNS                                                                                          | `loftlancer.com` DNS (mail, verification)                              | —                                                                                           | connected                 |
| Status page                                                                                            | Public `/status` from Better Stack API                                 | `BETTERSTACK_API_TOKEN`                                                                     | live (#369)               |
| [Better Stack Uptime](https://loftlancer.betteruptime.com)                                             | Uptime monitors + alerts                                               | `BETTERSTACK_API_TOKEN`                                                                     | connected (#356)          |
| Changelog / releases                                                                                   | `CHANGELOG.md`, tags, `/changelog`                                     | —                                                                                           | live (#368)               |
| `audit_event`                                                                                          | Audit trail when flag on                                               | `ACTIONS_AUDIT_ENABLED`                                                                     | partial (#357)            |
| Analytics consent                                                                                      | Gate GA4 / PostHog until consent                                       | —                                                                                           | live                      |
| SEO                                                                                                    | Sitemap, robots, JSON-LD (docs app)                                    | `NEXT_PUBLIC_DOCS_URL` (optional)                                                           | live (#352)               |
| [Google Search Console](https://search.google.com/search-console?resource_id=sc-domain:loftlancer.com) | Indexing                                                               | — (DNS verified)                                                                            | verified (#350)           |
| Bing Webmaster                                                                                         | Bing indexing                                                          | `BING_SITE_VERIFICATION`                                                                    | skipped (#350)            |
| [Google Analytics 4](https://analytics.google.com/analytics/web/#/p559253906)                          | Public site analytics (consent-gated)                                  | `NEXT_PUBLIC_GA_MEASUREMENT_ID`                                                             | live (#351)               |
| [PostHog](https://us.posthog.com/project/670026)                                                       | Studio product analytics (consent-gated)                               | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`                                       | live (#353)               |
| Mail app (#344)                                                                                        | Internal sent-mail mailbox                                             | —                                                                                           | planned                   |
| Google Cloud `loftlancer`                                                                              | OAuth + GA4 + GSC project                                              | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                                  | connected                 |

## Turning on an env-gated integration

GA4, PostHog, and search verification tags are read at **build time**. Set vars in Vercel Production, then ship with the next `main` deploy (Hobby: 100 deploys/day).

## Sentry test errors (#354)

Each app can emit a tagged test error (`test:true`, no PII). **Auth and studio** server triggers need `SENTRY_TEST_TOKEN` (32+ chars, Vercel Production, header `x-sentry-test-token`):

```bash
curl -i -X POST -H "x-sentry-test-token: $SENTRY_TEST_TOKEN" \
  https://loftlancer.com/auth/api/sentry-test
```

Browser: `/auth/sentry-test`, `/studio/sentry-test` (token + button). **Docs:** static `/sentry-test` (noindex, public DSN — watch quota).

Remove `SENTRY_TEST_TOKEN` when done so server routes return 404 again.
