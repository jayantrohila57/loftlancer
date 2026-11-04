# Public website (`apps/www`)

`apps/www` is the Next.js runtime for public routes. Page content, route
metadata, navigation, and site chrome are owned by `module/www`; route files
only re-export module pages. Reusable headers and footers live in
`module/shared/layout/` and are currently composed by `module/www`.

The app retains framework entry points: the root HTML layout and global CSS,
static assets, and consent-gated Next analytics integration. Tailwind scans
module and feature sources through `src/app/globals.css`.

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
