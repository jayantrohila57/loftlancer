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

- Marketing pricing page with Starter, Pro, Studio, and Enterprise tiers (placeholder prices), a comparison table and FAQ, a sign-in gate before Pro checkout, and success, cancel, and failure pages after subscription purchase.
- Subscription plans in the billing settings: Free and Paid, usage meters with 80% and 100% warnings, upgrade, cancel at period end, a customer billing portal, and an invoice list with PDF links.
- Studio settings billing page and a console admin view to review an organization's plan and usage and grant or override a plan.
- A 7-day grace period after a failed payment, then a downgrade to Free. Organizations that are over a plan limit stay read-only; existing files are not deleted.

## [0.0.1] - 2026-11-15

### Added

- Initial release.

[Unreleased]: https://github.com/white-ai/loftlancer-template/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/white-ai/loftlancer-template/releases/tag/v0.0.1
