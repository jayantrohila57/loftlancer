# Changelog

All notable changes to **loftlancer-template** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this monorepo follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with one product version in the root `package.json`. Workspace packages are
private and are not published on their own.

This file records only user-facing changes: new features, removals, breaking
changes, and user-visible behavior changes. Internal refactors, dependency
bumps, and implementation details are omitted.

| Range   | Meaning                                   |
| ------- | ----------------------------------------- |
| `0.x.y` | Template and pre-launch iteration         |
| `1.0.0` | Reserved for the first stable product cut |

Dates use IST (UTC+5:30). Reference issues or PRs as `(#123)` when applicable.
See [docs/releasing.md](./docs/releasing.md) for the release procedure and how
to write entries.

## [Unreleased]

### Added

- Public legal pages (Terms, Privacy, Cookie Policy) on the marketing site with localized copy (`en-us`, `en-in`, `es-es`).
- Sign-in legal notice and recording of terms acceptance for new accounts.
- Cookie consent banner on web, auth, and studio; analytics loads only after consent.
- Email verification on sign-up, a verify-email landing page, and **Resend verification** on the profile screen; organization invitations require a verified email before accept, with a clear prompt to verify.
- Change email from profile (confirmation to your current address, then verification at the new address).
- Sign-up and magic link reject disposable email domains; OAuth sign-in explains when an email is already registered with another provider and should be linked from Connected accounts.

### Added

- Studio now includes the full Auth organization, billing, subscription, AI usage, storage, and resource activity screens, including AI model usage, usage history, limits and alerts, storage files, storage activity, and trash.
- Studio organization home: a short onboarding flow when you have no organization, an organization switcher, and org-scoped pages for members, invitations, roles, ownership, billing, usage, and activity.
- Marketing pricing page with Starter, Pro, Studio, and Enterprise tiers (placeholder prices), a comparison table and FAQ, a sign-in gate before Pro checkout, and success, cancel, and failure pages after subscription purchase.
- Subscription plans in the billing settings: Free and Paid, usage meters with 80% and 100% warnings, upgrade, cancel at period end, a customer billing portal, and an invoice list with PDF links.
- Studio settings billing page and a console admin view to review an organization's plan and usage and grant or override a plan.
- A 7-day grace period after a failed payment, then a downgrade to Free. Organizations that are over a plan limit stay read-only; existing files are not deleted.

### Changed

- After email verification, welcome and first-login now continue into Studio. Organization billing, usage, and settings are available there; the existing Auth account pages are unchanged for now.
- Studio is split into three areas with their own sidebars: Organizations (`/organizations`), the org workspace (`/{org}` for home, usage, and activity), and Settings (`/settings/{org}` for general, members, invitations, roles, billing, ownership, and danger). Old `/{org}/settings` and `/{org}/billing` addresses redirect to the new settings paths.

### Fixed

- Start Pro trial on the pricing page no longer loops between sign-in and the pricing page. Signed-in users go to checkout; signed-out users are sent to sign-in once.

## [0.0.1] - 2026-11-15

### Added

- Initial release.

[Unreleased]: https://github.com/white-ai/loftlancer-template/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/white-ai/loftlancer-template/releases/tag/v0.0.1
