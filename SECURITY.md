# Security Policy

## Supported versions

Security fixes are applied on the **`main`** branch and released via Vercel deploys from `main`. Use the latest production deployment at [loftlancer.com/studio](https://loftlancer.com/studio).

| Version (package.json) | Supported |
| ---------------------- | --------- |
| 1.22.x (current)       | Yes       |
| Older tagged releases  | No        |

## Reporting a vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

1. Email the repository owner via the contact on their [GitHub profile](https://github.com/jayantrohila57) with:
   - Description of the issue and impact
   - Steps to reproduce
   - Affected routes or components (if known)
2. Allow reasonable time for a fix before public disclosure.
3. We will acknowledge receipt and share expected timelines when possible.

## Scope

In scope: authentication/session handling, authorization (`requireAction`), encryption of secret values, tRPC/API exposure, and data isolation between organizations and projects.

Out of scope: third-party services (GitHub OAuth, Neon, Vercel) except where this repo misconfigures them.

## Secure development practices

- Secrets live in environment variables — never commit `.env` files or real `ENCRYPTION_KEY` / `BETTER_AUTH_SECRET` values.
- Production schema changes require reviewed SQL, Neon backup branches, and explicit approval before `db:reset-seed` ([docs/database.md](./docs/database.md)).
- Deploy only from **`main`** after review ([AGENTS.md](./AGENTS.md)).
