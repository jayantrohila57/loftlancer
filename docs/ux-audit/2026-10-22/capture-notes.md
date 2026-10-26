# Loftlancer application screenshots

- Captured: 22 October 2026 from the live site at `https://loftlancer.com`
- Browser session: authenticated Studio account
- Files: 60 JPEG screenshots, one per captured route, saved in this folder
- File names follow route paths; `studio-organizations-directory-1.jpg` is the organizations directory.

## Included screens

- **Studio:** home, overview, organizations directory, notifications, activity, new organization, onboarding, and access denied.
- **Organization `lucsum`:** overview, activity, members, invitations, teams, roles and access, projects, settings, and new project.
- **Team `OVb1oXpeigx22f9FV0y6iDJsasnUDcgI`:** overview, members, invitations, projects, and settings.
- **Project `e-commerce`:** overview, apps, access, invitations, activity, settings, Environments, Environments settings, Tasks, and Tasks settings.
- **Support:** support home, help center, ticket list, and new ticket.
- **Account:** settings, profile, security, notifications, connected accounts, danger zone, delete, export, sessions, and activity.
- **Public site:** home, docs, about, features, pricing, changelog, status, privacy, terms, and legal pages.

## Screens not available in this account state

App-specific screens, environment/task detail screens, help article details, ticket details, invitation acceptance, and device-consent flows need a real app/resource ID or an active flow. The project currently shows Environments and Tasks as apps available to install, so no app-specific records were created for these screenshots.

Captures reflect the live UI and data available during the visit; empty states are preserved as shown.

## Supplementary coverage inventory (F-43)

The original 60 files are owner-only, desktop, dark-theme captures. The following
states are required before treating the audit as representative. These are
planned inventory rows, not completed evidence; leave the status as **Not
captured** until a screenshot is saved and reviewed. Never put real secret
values, invitation tokens, OAuth codes, or device codes in a screenshot.

| ID | State to capture | Route or setup | Proposed file | Status |
| --- | --- | --- | --- | --- |
| S61 | Light theme, Studio home | `/studio`; switch theme to light | `studio-home-light.jpg` | Not captured |
| S62 | Narrow mobile layout (375 px) | Organization overview; viewport 375 × 812 | `studio-org-375.jpg` | Not captured |
| S63 | Tablet layout (768 px) | Organization overview; viewport 768 × 1024 | `studio-org-768.jpg` | Not captured |
| S64 | Member role | Organization overview and project access; sign in as seeded member | `studio-member-access.jpg` | Not captured |
| S65 | Manager role | Organization members and project access; sign in as seeded manager | `studio-manager-access.jpg` | Not captured |
| S66 | Populated environment variables | Project environment; use synthetic names and masked values | `studio-env-populated.jpg` | Not captured |
| S67 | Populated task list | Project Tasks; include varied statuses and assignees | `studio-tasks-populated.jpg` | Not captured |
| S68 | Populated invitations | Organization and project Invitations; use synthetic addresses | `studio-invitations-populated.jpg` | Not captured |
| S69 | Invitation acceptance | Open a disposable, valid test invitation in a separate test account | `studio-invitation-accept.jpg` | Not captured |
| S70 | Not-found state | Visit a deliberately nonexistent public docs path | `docs-not-found.jpg` | Captured 2026-10-26 |
| S71 | Server-error state | Use an approved non-production error fixture; never trigger production failure | `studio-server-error.jpg` | Not captured |
| S72 | MCP connection flow | Open the documented MCP connect flow with a test client | `auth-mcp-connect.jpg` | Not captured |
| S73 | OAuth consent | `/consent` with a valid test authorization request and synthetic client | `auth-oauth-consent.jpg` | Not captured |
| S74 | Device sign-in entry | `/device` before entering a code | `auth-device-entry.jpg` | Captured 2026-10-26 |
| S75 | Secret reveal | Reveal a synthetic environment value; mask/replace it before saving evidence | `studio-env-reveal.jpg` | Not captured |

### Capture protocol

- Record route, viewport, theme, role, seeded-data fixture, capture date, and
  screenshot filename for every row. Keep each screenshot at its stated viewport.
- Use dedicated test accounts and synthetic project data for member, manager,
  invitation, OAuth, device, and secret states. Do not grant access to production
  resources to create audit evidence.
- Capture 375 px and 768 px separately; desktop screenshots do not satisfy
  either row. For role comparisons, include the same resource in both accounts.
- For an error state, use a non-production fixture that renders the application's
  designed error UI. A browser network error or developer-tools screen is not
  product evidence.
- Mark a row **Captured** only after checking that the image is readable and
  contains no credential, token, personal address, or unmasked secret. If a
  flow cannot be safely prepared, record the setup blocker instead of fabricating
  a screenshot.
