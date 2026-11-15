# Package `better-auth`

Better Auth server + React client for the monorepo. Folder **`better-auth`** → **`@packages/better-auth`**.

| Export                         | Use                                                                        |
| ------------------------------ | -------------------------------------------------------------------------- |
| `@packages/better-auth`        | `auth`, `getAuth()` — route handlers, RSC                                  |
| `@packages/better-auth/client` | `authClient` only — session/sign-in from `@modules/auth` and other modules |

**MUST NOT** import `better-auth` directly in apps or modules — use this package.

Schema: `@packages/drizzle` (regenerate with `npx auth@latest generate --config packages/better-auth/better-auth.config.ts`).

Magic-link delivery: `@packages/resend` (`sendResendEmail`) — **MUST NOT** import `resend` here.
