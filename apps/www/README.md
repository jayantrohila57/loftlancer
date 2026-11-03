# Public website (`apps/www`)

`apps/www` owns the public marketing and legal pages on `loftlancer.com`. App
routes stay thin; shared marketing UI comes from `@loftlancer/ui/marketing` and
`@features/marketing`.

## Routes

| Route                   | Page                      |
| ----------------------- | ------------------------- |
| `/`                     | Home                      |
| `/features`             | Features                  |
| `/pricing`              | Pricing                   |
| `/about`                | About                     |
| `/status`               | Service status            |
| `/changelog`            | Release notes             |
| `/sign-in`              | Sign-in options           |
| `/privacy`              | Privacy policy            |
| `/terms`                | Terms of use              |
| `/legal/contact`        | Contact                   |
| `/legal/security`       | Security                  |
| `/legal/cookies`        | Cookie policy             |
| `/legal/dpa`            | Data processing agreement |
| `/legal/acceptable-use` | Acceptable use            |

`/docs` and `/docs/*`, `/api/health`, `/api/mcp`, `/sentry-test`, `/robots.txt`,
and `/sitemap.xml` are served by the `docs` Vercel service. Its Next static
assets use `/docs-static/*`; the public app owns the root `/_next/*` assets.
Unknown public paths reach the `www` app and use its not-found page.

## Local development and checks

- `pnpm --filter www dev` — port 3004
- `pnpm --filter www check-types`
- `pnpm --filter docs check-types` — docs app remains the owner of docs content

Route ownership and public rewrites are configured in the root `vercel.json`.
