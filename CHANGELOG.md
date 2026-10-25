# Changelog

All notable changes to Loftlancer are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the platform follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with one product version for the whole monorepo (root `package.json`).

- `0.x` covers releases before the Loftlancer product launch.
- `1.0.0` is the Loftlancer rebrand on `main`.
- After that, every `dev` → `main` release bumps the minor version for
  feature releases and the patch version for fix batches.

Dates are in IST (UTC+5:30). Numbers like #123 are GitHub issues or pull
requests. See [docs/RELEASING.md](./docs/RELEASING.md) for the release procedure.

## [Unreleased]

### Changed

- Matched shared loading and error-state surfaces to compact page spacing and radii (#834).

## [1.19.13] - 2026-10-25

### Changed

- Standardized dialogs and sheets on the compact overlay spacing and radius scale (#830).
- Applied compact table-state and app-directory spacing to invitations and project apps (#829).
- Standardized organization, project, and account settings frames on the compact spacing scale (#828).
- Standardized project and app cards on the compact grid and surface scale (#827).
- Aligned notification and project-access states with the compact page layout scale (#826).

## [1.19.12] - 2026-10-25

### Changed

- Applied the compact layout scale to team loading and shared settings panels (#825).
- Standardized shared cards, frames, and table density on the compact layout scale (#824).
- Added a clear, public-first getting-started path to the documentation entry page (#812).
- Added stale-status warnings, manual refresh, and full public-surface monitoring to Status (#811).
- Clarified Loftlancer's mission, access, configuration, documentation, and open-source links on About (#809).

## [1.19.11] - 2026-10-25

### Changed

- Clarified the current free early-access offering and linked Pricing directly to sign-in (#808).

## [1.19.10] - 2026-10-25

### Security

- Bumped Next.js from 16.4.0 to 16.4.3 across www, auth, studio, and docs via `next upgrade --agent=security` (#819).

### Changed

- Added an authentic Studio overview image to the responsive public landing hero (#805).
- Added real-product workflow, access, connection, and FAQ sections to the public landing page (#806).
- Clarified the available project apps, access model, activity history, and planned connections on Features (#807).
- Standardized the public marketing shell with responsive navigation, grouped footer links, and shared cross-app routes (#804).

## [1.19.9] - 2026-10-25

### Fixed

- Matched organization Settings loading geometry to its full settings page (#740).
- Unified project Settings loading states and removed the duplicate transition (#741).
- Aligned the organization Overview navigation row with every organization tab (#742).
- Kept Activity filters in the page content so they no longer appear late or shift the layout (#743).

## [1.19.8] - 2026-10-25

### Changed

- Clarified onboarding navigation and organization slug availability (#664).
- Added an inventory for additional UX audit states and roles (PR 724).
- Increased shared sidebar action targets to 24 × 24 px (PR 732).

## [1.19.7] - 2026-10-23

### Changed

- Improved Support ticket creation and the empty Help center state (#660).
- Constrained dashboard content at wide widths (#666).
- Standardized dates across management lists and verified changelog release dates (#667).
- Removed empty navigation and list artifacts (#668).
- Improved contrast, keyboard focus, and permission labels in shared controls (#669).

## [1.19.6] - 2026-10-23

### Changed

- Add account notification delivery preferences and return navigation (#648).
- Standardize required-field cues across management forms (#653).
- Clarify organization branding actions and confirm logo removal (#654).
- Explain invitation scope and unify organization, team, and project access flows (#656).
- Align role descriptions and permission matrix labels (#657).

## [1.19.5] - 2026-10-23

### Changed

- Made access-denied pages explain next steps and link to available areas (#646).
- Clarified project deletion, recovery, and status controls (#650).
- Standardized create, save, and invite action labels across management pages (#651).
- Opened support ticket creation in a consistent form sheet (#652).
- Made shared accordion controls keyboard accessible and exposed their expanded state (#655).

## [1.19.4] - 2026-10-23

### Changed

- Aligned account navigation with the shared signed-in shell, switched OAuth/device authorization to a single-column layout, and standardized secondary marketing pages on the public shell (#635).
- Removed duplicate organization overview/activity links and moved team/project list navigation to the sidebar (#636).
- Standardized organization, team, and project terminology and labeled same-name default teams consistently (#629).
- Clarified that project apps are installable project features, distinct from dashboard, sign-in, and documentation surfaces (#631).
- Replaced internal product names and engineering terms in user-facing copy (#632).

## [1.19.3] - 2026-10-23

### Changed

- Replaced project access jargon with plain language for team access, individual access, and how access works (#633).
- Aligned public Documentation labels, defined DPA on first use, and matched changelog badge names to their headings (#634).
- Use the shared breadcrumb trail instead of duplicating it with back arrows in resource frames (#637).
- Resolve breadcrumb names from cached organization, project, and team data without exposing team IDs or loading skeletons (#638).
- Keep project navigation tabs consistent across overview, Activity, Environments, and installed app pages (#639).

## [1.19.2] - 2026-10-23

### Changed

- Standardized the features page into a three-column card grid and labeled MCP as coming soon (#663).
- Removed redundant docs sidebar section headings that duplicated their first folder labels (#665).
- Standardized organization, support-ticket, and invitation lists around the shared search, filter, sort, and pagination toolbar patterns (#658).

### Fixed

- Redirect the account settings landing page to Profile so the tab bar is the single navigation pattern (#641).
- Show organization, project, and team descriptions only on their overview pages to remove repeated subtitles across management tabs (#640).

## [1.19.1] - 2026-10-23

### Changed

- Standardized Activity labels across account, organization, and project pages; routed the duplicate account-settings entry to the shared Activity page (#630).

### Fixed

- Hide list pagination when results fit on one page, including empty invitation lists (#659).
- Removed the unmonitored Landing row from the public status board and made truncated monitor URLs accessible in a tooltip (#661).
- Added a high-contrast scrim behind the split-layout quote so animated artwork cannot obscure its text (#662).
- Standardized support, project invitation, help search, and project overview empty states with clear next actions (#645).

## [1.19.0] - 2026-10-23

### Added

- Populated Studio Overview with favorite organizations, recent projects, pending invitations, and permission-checked recent activity (#643).
- Add the 22 October 2026 UX audit and 60 screenshot evidence files for tracked fixes (#627).
- Add the dedicated `apps/www` marketing site and route its sign-in CTAs to auth with the validated studio return URL (#103)

### Fixed

- Added a direct Environments install action and first-variable setup for new projects (#642).
- Standardized route and account loading states with delayed, layout-matched skeletons and retryable timeout errors (#644).
- Clarify account anonymization and retention, require matching email confirmation, and show post-deletion guidance on the public landing page (#647).
- Make all project creation fields editable from project settings and validate project date order (#649).
- Replace the ignored Sentry transaction scrubber with `beforeSendSpan` for the default streamed trace lifecycle (#354)
- Made soft-deleted projects and their related environments and variables recoverable from Studio (#463).
- Marked authenticated auth settings responses as private and non-cacheable (#363).

## [1.18.0] - 2026-10-22

### Added

- Added a permission-checked member access view spanning organization roles, teams, projects, apps, and audit activity (#590).

## [1.17.1] - 2026-10-22

### Security

- Prevented project, team, and member access links from crossing organization boundaries in the database and server-side manager assignment workflow (#586).

## [1.17.0] - 2026-10-22

### Changed

- Added a dedicated `/organizations` directory with responsive organization cards and moved its create action into the header (#610).
- Reorganized Studio navigation into collapsible groups and introduced a dedicated Overview landing page with organization favorites (#609, #611).

## [1.16.2] - 2026-10-22

### Changed

- Simplified homepage sign-in, centered product features in the branding panel, and moved public links into its footer with a mobile page-footer fallback (#605).

## [1.16.1] - 2026-10-22

### Added

- Improved narrow-screen dashboard navigation, resource tabs, and table search/pagination controls (#593, #594, #595).
- Improved mobile organization and team access tables, project/app access lists, task rows, environment variable controls, and management sheets (#596, #597, #598).
- Added a route-by-route mobile dashboard verification checklist and recorded the visual checks awaiting browser access (#599).
- Added Project purpose, documentation, and schedule fields; Team purpose and descriptions; and member history details for scoped management forms (#585, #587, #588, #589).
- Added additive Project, Team, team-member, and organization-member schema fields for profile and change provenance; existing records retain unknown historical actors (#585, #587, #588, #589).
- Added organization member profiles, scoped custom roles, suspension controls, and invitation lifecycle tracking with shared permission enforcement (#579).
- Added organization-level presentation defaults and apply saved project visibility to new projects (#577).

- Added a typed organization profile, owner-only private details, safe archive/restore lifecycle, and archived-write enforcement across tRPC, MCP, and Better Auth (#575).
- Added owner-managed HTTPS organization logos and consistent logo previews in organization cards, lists, and switcher (#576).

### Security

- Added owner-verified organization email domains with expiring DNS challenges and clear security capability status (#578).

## [1.16.0] - 2026-10-21

### Added

- Added app-level user and linked-team access controls with server-side enforcement and effective access explanations (#561).

## [1.15.1] - 2026-10-21

### Changed


## [1.15.0] - 2026-10-21

### Changed

- Defined the management resource and access contracts and redirect legacy Environment and Task paths into canonical project Apps routes (#543, #544).

### Security

- Permission checks and client snapshots now reject inactive organizations and cross-organization project IDs consistently (#545).

### Fixed

- Studio navigation now highlights the active project through nested pages and keeps active favorites selected (#546).
- Resource frames now resolve one active tab consistently, and project status changes use a form control rather than navigation tabs (#547).
- Organization list actions no longer duplicate in empty states, and settings loading placeholders now match the accordion sections they load (#551).
- Organization member, invitation, team, and role routes now use one top-level navigation row; role access details use accordions without action-count metrics (#552).
- Organization, team, and project invitation lists now share the same status filter and pagination controls and label each row with its access scope (#553).
- Project identity and lifecycle edits now live in the Project settings sections; the overview no longer duplicates its actions and edit sheet (#554).
- Project Access now lists each active member with their effective project capabilities and the organization role, team, creator, manager, or grant sources that provide them (#555).
- Project invitations now use the shared guarded bulk-invite dialog, with project-scoped duplicate checks, feedback, and acceptance details (#556).
- Team overview no longer shows member/project counts; team settings now use matching accordion sections and explain how team deletion affects project access (#557).
- Teams now persist lead/member roles: leads can manage their own roster, while organization owners/managers retain role, project-link, and settings control (#558).
- Team invitations now show their team and linked project access, use the scoped acceptance flow, and are canceled when the team is deleted (#559).
- Project Apps now separate installed, available, and retained app data; canonical Tasks and Environments routes render behind install checks instead of redirecting back to themselves (#560).
- Project access context now exits safely when a nullable project-to-organization relationship is absent (#558).
- Removed redundant project overview wrapper markup flagged by the repository lint gate (#554).
- Legacy Environment and Task redirects now satisfy Next.js typed-route checks during production builds (#566).
- Standardized project and organization overview/access/settings sections on accordions and aligned their loading skeletons (#548).
- Team member/project lists and project access lists now use the shared searchable, sortable, paginated table and consistent row actions (#549).
- Project lifecycle confirmations now use the shared confirmation component directly across overview and settings actions (#550).

## [1.14.11] - 2026-10-21

### Fixed

- Organization invitation emails now default to the verified `mail.loftlancer.com` sender and report skipped or failed delivery instead of silently succeeding (#358).

## [1.14.10] - 2026-10-20

### Security

- Sensitive authentication, permission, deletion, and secret actions always write audit events, even when optional audit logging is disabled (#357).

## [1.14.9] - 2026-10-20

### Fixed

- The version badge accessible name now includes its visible label.

## [1.14.8] - 2026-10-20

### Added

- A local schema check detects changes since the last reset-seed and offers a guarded owner-preserving reset (#84).

## [1.14.7] - 2026-10-20

### Added

- Auth rate limits, including magic-link requests, now use shared Upstash Redis across serverless instances and fail open when Redis is unavailable (#381).

## [1.14.6] - 2026-10-20

### Changed

- Production database startup now warns when Neon SSL mode is not `verify-full` (#83).

### Fixed

- Batch variable creation now ignores soft-deleted environments and variables (#32).
- Sign-in clicks now emit consent-gated GA4 events for each provider (#382).

## [1.14.5] - 2026-10-20

### Fixed

- Account notification settings now render the shared interactive accordion without a server error (#520).

## [1.14.4] - 2026-10-20

### Changed

- Notification date groups and account preferences now use the shared accordion; notification filters no longer show a summary count (#516).

## [1.14.3] - 2026-10-20

### Changed

- Dashboard page actions now follow their section navigation, resource subsections use accordions instead of nested tab bars, and dashboard metric cards are removed (#515).

## [1.14.2] - 2026-10-20

### Changed

- Release validation no longer installs Playwright or runs browser accessibility tests; lint, route checks, typechecks, tests, and production builds remain (#512).

## [1.14.1] - 2026-10-20

### Changed

- Studio navigation groups organization destinations, teams, projects, and project apps by scope, with one canonical selected location (#492).
- Organization navigation groups Members, Invitations, Teams, and Roles under People; team access changes explain their project permission effects and require confirmation (#495).
- Project overview summaries no longer repeat navigation links already present in the project frame; the Apps destination remains the single route into app management (#496).
- Project manager removal and team unlinking now explain which project permissions change before confirmation (#496).
- Project app screens now distinguish load failures from uninstalled apps, provide retry and empty states, and avoid duplicate app names or navigation actions (#497).
- Task and invitation notifications now open the correct scoped destinations, unresolvable notices have no self-link, and activity destinations name their personal or organization scope (#498).
- Notifications filters and mark-read actions now live in the page content instead of the navigation header (#498).
- Support now has persistent Tickets/Help navigation with route-aware Back links; Account headings and settings labels clarify their scope (#499).
- The route matrix now records page-owned actions, scoped settings labels, and route-aware Support parents alongside the remaining live QA requirements (#500).

### Fixed

- Project Back links now follow tested route parents through Apps, Environments, Tasks, and app settings; page sections keep a single Back control (#493).
- Resource navigation frames now keep module actions and account diagnostics in their owning page content instead of repeating them across tabs (#494).
- Pages without sibling navigation no longer show an “All” tab; project overview and account profile also drop duplicate controls and headings (#494).
- Organization member, team, and invitation pages now surface load failures with retry and avoid repeating invite actions in empty states (#495).
- Project access and settings now show retry states for failed requests instead of empty data or a misleading missing-page result (#496).

## [1.14.0] - 2026-10-20

### Added

- Team overview, members, linked projects, invitations, and settings are dedicated pages; projects have dedicated access and invitation pages (#507).
- Project invitations grant project read access when accepted, including for existing organization members (#507).
- Project activity now has a dedicated page and project-scoped audit permission (#507).

### Changed

- Tasks and Environments now live under each project's Apps URL; existing app links remain reachable (#507).

## [1.13.3] - 2026-10-19

### Fixed

- Organization and project shells reuse server-verified scope identity and clear only scoped query caches when switching organizations (#500)

## [1.13.2] - 2026-10-19

### Fixed

- Studio navigation and management pages clarify the organization, team, project, app, and account hierarchy and remove duplicate controls (#491)

## [1.13.1] - 2026-10-19

### Changed

- Routine pull requests run fast CI checks while release validation retains the full build and accessibility suite (#487)

### Fixed

- Automated release publishing configures the Git identity needed to create its version tag (#487)

## [1.13.0] - 2026-10-19

### Changed

- Studio sidebar footer includes product updates, help and support links, copyright, and the current version (#483)
- Sidebar favorites are limited to three, a Teams section links to organization teams, and the duplicate account footer is removed (#473)

### Fixed

- Organization member management shows membership and invitation context, uses action menus, and moves ownership transfer into a sheet; organization activity is grouped in collapsible date sections (#479)
- Organization actions are available in the shared header, and pending invitations are managed from the Invitations tab instead of being duplicated on Members (#479)
- Organization overview removes redundant metadata and health rails, uses compact summary cards, and lists recently updated projects (#477)
- Organization directory headers align without phantom back buttons or empty metadata spacing; the directory uses the shared table, drops redundant summary cards, and provides an incoming invitations view with working notification links (#475)
- Project routes render their own navigation shell without nested organization tabs, and organization back navigation respects the Studio base path (#464)
- Organization invitations have a public, account-aware accept and decline flow with explicit expired, revoked, and unavailable states (#432)
- Organization owners can remove members with confirmation, and removed users’ team and project access is cleaned up within that organization (#433)
- Organization ownership transfers are transactional, audited, and guarded against removing or demoting the final owner (#434)
- MCP organization invitations reject duplicates, send the shared invite email, audit lifecycle changes, and add accepted members to assigned teams (#435)
- Team lifecycle mutations validate organization membership, repair member counts, preserve audit history, and revoke deleted-team access (#469)
- Team members invited or added after a team is linked to a project receive its default read grants (#469)
- Project permissions require active organization members and same-organization teams; deleted teams no longer grant project access (#470)
- Project pages keep shared project identity and actions in one header, move app navigation into the Apps view, and compact the project directory (#481)

## [1.12.6] - 2026-10-19

### Added

- GitHub Actions automates release preparation, promotion PRs, and GitHub Release publishing while retaining a human production merge gate (#459)

## [1.12.5] - 2026-10-19

### Fixed

- New accounts without an organization are sent to onboarding instead of being blocked by the organizations page guard (#455)

## [1.12.4] - 2026-10-19

### Fixed

- Keep organization, project, and account settings identity and navigation stable while route content changes (#451)

## [1.12.3] - 2026-10-18

### Fixed

- Projects grid cards use equal widths and keep New project available in the page header (#55)
- Notification list rows use the ghost Button (#38)
- Timeline: readable labels, actor/project filters, and passive reads hidden (#68)
- PWA manifests: screenshots, paths, maskable icons, and OG image (#404)
- Project list and detail RBAC scope aligned in the API (#26)
- Page descriptions: xs type, two-line clamp, and more/less toggle (#78)
- E2E routes require an explicit `E2E_TEST_SECRET` (#20)

## [1.12.2] - 2026-10-17

### Fixed

- Studio Members page pending invitations match the Invitations query (#50)
- Settings link restored in the studio sidebar footer (#79)
- Page header spacing and primary action alignment (#77)
- Unsaved-changes guard covers the remaining edit flows, and the unsaved-changes Playwright suite is restored (#76)
- Regression tests for `account.exportData` soft-delete scope (#39)

## [1.12.1] - 2026-10-17

### Added

- Sentry test-error triggers to confirm readable stack traces in production: `POST /api/sentry-test` and a `/sentry-test` page in auth and studio, guarded by the new server-only `SENTRY_TEST_TOKEN` (404 while unset; the token is scrubbed from Sentry events), and a hidden button page at `/sentry-test` on docs. Events are tagged `app` and `test: true` and carry no user data (#354)

### Fixed

- Studio sidebar platform nav and org-scoped pages resolve loading from SSR-hydrated data without waiting for a second client bootstrap or user interaction; nav count badges reserve space while counts load (#63)
- Account settings use `LocalDateTime` (shared `formatDate`) for linked-provider and audit-rail dates; activity heatmap cell tooltips use the same date style (#73)
- `audit.stats` documents and tests scoped SQL aggregates (user and optional `projectId` filter) for totals and per-action counts (#35)

## [1.12.0] - 2026-10-17

### Added

- Root `pnpm a11y` and CI run the Turbo `a11y` task in `apps/docs` (Playwright + axe on the docs landing; fails in CI when Playwright cannot run, optional local skip via `A11Y_SKIP`) (#91)
- E2E demo environment variable seeding: encrypted fake placeholders for the Playwright demo project, production guards (`VERCEL_ENV` / `NODE_ENV` + opt-in), and `fake-dev-only` markers on reset-seed sample variables (#85)

### Fixed

- Studio projects and organizations list sort controls are single-select dropdowns without a search field (#57)
- `purge.test.ts` no longer loads the database client at import time; DB purge deps moved to `purge-db` (#414)
- Sentry Logs from auth, studio and docs flush on the server via a coalesced `Sentry.flush` + Vercel `waitUntil` after `@loftlancer/logger` entries, so buffered SDK logs are not dropped when serverless handlers exit before the default 5s timer; browser logs keep SDK batching (#355)
- Auth settings redirect routes (`/settings`, `/settings/export`, `/settings/delete`) use async Server Component page wrappers again after the account→auth app split (#37)
- Studio org settings: General/Danger tabs use horizontal underline tabs (aligned with other settings surfaces); edit-organization sheet Cancel and dismiss run through the unsaved-changes guard (#72)

## [1.11.1] - 2026-10-17

### Fixed

- Invitation notification sync mutations: unit tests for allowed and denied authorization paths (#18)
- Withdrawing analytics consent in Studio now stops PostHog capture and session replay at once, without a page reload; accepting again turns capture back on (#353)
- README sign-in methods, pnpm/Node prerequisites, and Studio URL; SECURITY.md supported version; integrations inventory PostHog opt-out and centralized logs release status; align `scripts/README.md`, getting-started, `PRODUCTION_DEPLOY.md`, and `summary.md` with path routing on loftlancer.com (#400)

## [1.11.0] - 2026-10-17

### Added

- Studio product analytics in PostHog, after consent only: the signed-in user is identified by id (no email or name) with the active organization as a group, PostHog is reset on sign-out, and core events are captured for organization, project and environment creation, onboarding completion, member invites and variable create/update/delete/import. Event properties carry counts and enums only, never variable keys or values (#353)
- Browser logs from auth, studio and docs are forwarded to Sentry Logs (#355)
- Loftlancer brand kit in the README and `.github/brand/`, using the Lucide Layers mark (#393)
- Issue forms, a pull request checklist and `docs/REVIEW_CHECKLIST.md` for contributors (#384)

### Changed

- Sentry browser SDKs in auth and studio set the signed-in user id and active org id (ids only) (#354)
- Stale Collidr, "C" and Env Manager branding is replaced with the Lucide Layers mark (#394)

### Fixed

- Signed-out session-gate redirects in auth and studio send `Cache-Control: private, no-store` (#363)
- Footer links and the logo link have 24px touch targets (#390)
- Changelog badge and docs muted text meet 4.5:1 contrast, and the shared warning token moves to amber-800 (#391, #392)
- Dark-mode muted text and the auth warning token have higher contrast (#396)

## [1.10.0] - 2026-10-17

### Added

- Health endpoints for uptime monitors: `/api/health` (docs), `/auth/api/health` and `/studio/api/health` return the app name, version and, for auth and studio, a database check. They are never cached or indexed (#356)
- Server logs from every app go to Sentry Logs through a shared `@loftlancer/logger`, as one JSON line each in the Vercel runtime logs (#355)

### Changed

- Sentry events carry the product version as their release and, on signed-in server requests, the user id and active org id (ids only) (#354)
- Favicons and social images on the public site are cached in the browser for a day (#363)

## [1.9.1] - 2026-10-17

### Fixed

- `biome ci` now passes cleanly: the whole repo is formatted with sorted imports, and the remaining lint is fixed without changing behaviour (#377)
  - Non-null assertions are gone from the soft-delete helpers and app install flows
  - Optional-chain cleanups, unused imports and an unused prop removed
  - The variables table's reveal callback is memoized so its deps are complete
  - Re-measure and reset effects that depend on trigger values carry a documented `biome-ignore`
  - `biome.json` moves to `preset: "recommended"`, and the generated MCP catalog is excluded

### Changed

- CI's quality job runs `pnpm lint:ci` (`biome ci --error-on-warnings`), so formatting and lint stay green (#377)

## [1.9.0] - 2026-10-17

### Added

- Semantic versioning for the whole platform: one root version, a backfilled changelog for every release since the first commit, git tags and GitHub Releases per version, a release procedure and a CI check on release PRs (#368)
- `/changelog` renders from this file as a timeline, and a version badge links to it from the docs footer and studio (#368)
- Status page at `/status`, built from Better Stack monitors, uptime and incidents (#369)
- Sign in with Google next to GitHub, shown only when Google is configured (#359)
- Magic-link sign-in by email, sent through the shared Resend sender with a React Email template (#373)
- Sign-in errors from GitHub, Google or an expired email link show on the landing page (#373)
- Google can be connected in account settings next to GitHub (#359)

### Changed

- Sign-in is passwordless only: GitHub, Google and magic link. Email and password sign-in is disabled on every auth instance, and the local e2e login no longer uses a password (#373)
- GA4 loads through the official `@next/third-parties` Google Analytics component, still only after consent and only when the measurement ID is set (#351)
- New service env vars are declared in turbo's build env list, and env validation accepts the optional Google, Resend and Better Stack keys (#370)
- The docs site gets a footer with Changelog and Status links (#368, #369)
- GA4 (public site) and PostHog (studio) are switched on in production now that their keys are configured; both still load only after consent (#351, #353)
- `docs/integrations.md` covers Better Stack, the Google Cloud project (OAuth, GA4, Search Console), PostHog and passwordless auth (#371)

### Removed

- Email and password sign-in. Production had no password accounts, so nobody loses access (#373)

## [1.8.0] - 2026-10-17

### Added

- SEO groundwork: `metadataBase`, canonical URLs, a unique title and description per public page, a public-only sitemap, robots rules that block `/studio` and `/auth`, and JSON-LD on the home page (#352, PR #366)
- Cookie consent banner with env-gated GA4 (public site) and PostHog (studio) wrappers that load only after consent (#365)
- Sentry source-map upload via `withSentryConfig` for studio, auth and docs (#364)
- Services and integrations inventory in `docs/integrations.md` (#361)

## [1.7.1] - 2026-10-17

### Fixed

- Sentry and Vercel env vars are passed through turbo builds so production picks them up (#347, PR #348)

## [1.7.0] - 2026-10-17

### Added

- Vercel Web Analytics and Speed Insights (#342)
- Sentry error monitoring for studio, auth and docs, off until a DSN is set (#339)
- `@loftlancer/email` package with React Email templates and Resend; organization invite emails (#335, #336, PR #343)
- One shared email sender with a recorder hook for the Mail app (#344, PR #345)

### Fixed

- Notifications: the first date group no longer says "Yesterday" for rows stamped "Today" (#325)
- Variables page and projects list skeletons match the loaded layout, with no layout shift (#326)
- Project overview "Updated" time no longer changes after hydration (#327)
- Page titles for Support and account Profile (#328)
- Account settings header matches studio: breadcrumbs, navigation and Activity naming (#329)
- The landing page logo links home (#330)

## [1.6.4] - 2026-10-17

### Fixed

- Proxy guard against org-sync redirect loops when switching organizations (#299, PR #331)

## [1.6.3] - 2026-10-17

### Changed

- Duplicated UI merged into `@loftlancer/ui`: primitives, app shell, empty and page states; unused primitives removed (#220, PR #323)

## [1.6.2] - 2026-10-17

### Fixed

- Production QA batch (PR #321): user menu Docs link (#312), active org in the sidebar switcher (#313), sidebar Projects count (#314), org overview Projects stat link (#315), accessible names on icon-only project links (#316), not-found breadcrumb and title (#317), env variables Updated column and env tabs in the URL (#318), auth settings shell matches studio (#319), `pnpm lint` ignores `apps/docs/out` (#320)

## [1.6.1] - 2026-10-17

### Fixed

- Trailing-slash URLs such as `/studio/` and `/docs/` redirect instead of returning 404 (#305)
- Studio navigation links to Support, and not-found pages return HTTP 404 (#306)
- Unknown routes under a real organization or project return a real 404 (#309)

## [1.6.0] - 2026-10-17

### Added

- Route builder in `utils/navigation.ts` with a CI check against old `/dashboard` and `/p/` literals (#300)

### Changed

- Hierarchical studio routes: `/studio` (org list), `/studio/[org]`, `/[org]/[project]` and app routes under the project (#299)
- Project slugs are unique per organization, with a migration (#301)
- Auth simplified: no sign-in, sign-up or sign-out screens; sign-in starts GitHub directly (#302)

## [1.5.0] - 2026-10-17

### Added

- Shared searchable combobox in `@loftlancer/ui`, with pickers converted to it (#278)
- Entity references render as real links (#279)

### Changed

- Header icon buttons and avatar use one dense size (#276)
- One shared user menu for the header avatar and the sidebar footer (#277)
- One PageHeader across dashboard, settings, org, project and app pages (#287, #294)
- One shared data table for every listing, including tasks and account sessions (#288, #290)
- Assignee picker shows name and email stacked in a wider popup (#297)

### Fixed

- Browser QA fixes: team members retry loop, header bell size, org create cancel, assignee emails (#286, PR #289)

## [1.4.0] - 2026-10-17

### Added

- Apps system: `project_app` foundation, environments as an installable app, project routes (#245, PR #247)
- Tasks app MVP: task tables, list view, detail sheet, comments, assign and mention notifications (#246)
- Apps leftovers: daily purge of uninstalled app data after 30 days, app settings screen, edit and delete own comments, paged invitations, shared count badge (#257, #258, #260, #261, #262, #266, PR #268)
- Docs: apps system, URLs, tasks guide and the current deploy layout (#263)

### Changed

- Notifications page and bell redesigned after ReUI (#253, PR #255)
- Landing app list and honest free pricing and FAQ (#219)

### Fixed

- Signed-in QA: seed IDs, studio basePath links, `projects.get` N+1, org member counts, onboarding 500 (#248, #249, #250, #251, #252, PR #254)
- Pricing CTA text and features card spacing (#269, #270)
- App settings reset to defaults with confirm, mark-all-read audit tracing, pricing title gap (#273, #274, #275, PR #280)

## [1.3.0] - 2026-10-16

### Added

- Layouts: public sidebar for legal pages, auth-5 split groups, studio onboarding group (#203)
- Shared zero-layout-shift loading, empty, error and saving states (#206)
- Variables table: reveal and copy, Copy as .env, paste .env import (#209)
- Three-step onboarding: organization, project, CLI (#210)
- Bulk email invite dialog and invite-first-member empty state (#211)
- Sessions and security: device, IP, current badge, revoke one or all others (#212)
- OAuth consent and device approval cards with a segmented code input (#213)
- Real empty states for projects, environments, notifications and teams (#214)
- Org role capability cards and denser org settings (#215)
- Notifications page: mark all read, day groups, all-caught-up state (#216)
- Connected accounts with status badges and connect or disconnect (#217)
- One confirm dialog with type-to-confirm for deletes (#218)
- Stress-test seed and cleanup scripts (#235)

### Changed

- Pre-commit lints only staged files; existing Biome errors fixed (#229)

### Fixed

- Empty variable values decrypt safely in the variables list and .env export (#237)
- Disconnecting an account uses the provider account ID (#217)

## [1.2.0] - 2026-10-16

### Added

- Sign-in with the auth-5 block and a full-page auth layout (#179, #182)
- Account and organization settings redesign (#185)
- One shared app shell (sidebar, inset, header, breadcrumb) and full-width settings (#191)
- Shared activity timeline for account and organization (#197)
- Sidebar: brand, ⌘K search, count badges, favorites, footer user menu (#200)

### Changed

- Consolidated to three apps (docs at `/`, auth at `/auth`, studio at `/studio`) on one Vercel project; console and MCP apps removed (#163, PR #164, #166)
- README: product summary and the three-app architecture (#169)

### Fixed

- Better Auth served at `/auth/api/auth` on the single-project deploy (#168)
- basePath-safe redirects, tRPC URLs and sign-out; docs branding (#172)
- Users with no organization reach onboarding instead of a forbidden page (#175)
- Organization create 500, slow DB connects, profile stats stuck on skeleton (#178)
- Signed-in QA: direct org loads, org list race, slow loads, audit labels (#188)
- Live QA: heatmap dates, read audit flood, duplicate member search, slow org pages (#194)

## [1.1.0] - 2026-10-15

### Added

- Shared dashboard app shell for auth settings, studio and console (#149)
- Console support access for platform admins, global sign-out across apps, studio home redirect (#150)
- Open-source and sponsor readiness: license, community files, FUNDING.yml, templates (#162)

### Changed

- Production cutover to loftlancer.com: env vars, GitHub OAuth callback, repo rename (#151, PR #161)

## [1.0.1] - 2026-10-14

### Fixed

- QA batch: studio variables delete and edit sheet (#138), notifications layout (#139), project row menu skeleton (#140), org members and cross-org isolation (#141), org settings, roles and timeline (#142), auth settings and return_to (#143, #144), console forbidden loop (#145), docs typography, sitemap and robots (#146), MCP CORS (#147)
- Platform performance: batched permission lookups and fewer refetches (#148)

## [1.0.0] - 2026-10-14

The product is now Loftlancer.

### Changed

- Rebrand Collidr to Loftlancer (loftlancer.com): npm scope `@loftlancer/*`, production URLs on loftlancer.com, `loftlancer` cookie prefix with migration from `collidr` cookies, docs and repository references (#137)

## [0.10.0] - 2026-10-14

### Changed

- Fewer serverless functions: the web service dropped, www and docs exported statically (#128)
- Support split into studio, console and www; account merged into auth; per-app Vercel deploys (#129)
- Vercel deploys only from `main`, with a `dev` branch workflow (#131)

### Fixed

- Live QA: cross-app auth, CORS, console session, MCP well-known, support route (#130)
- Post-QA: studio project crash, console forbidden, auth return_to, performance (#132)
- Variables SSR guard, pooled DB URL, console allowlist, performance (#133)
- actionGuard input order, console sign-in, notification layout (#134, PR #135)

## [0.9.0] - 2026-10-14

### Changed

- Rebrand env-manager to Collidr (#126)
- All dependencies upgraded to their latest stable versions, with modern stack patterns adopted (#127)
- Middleware migrated to a Node proxy for Vercel Services

### Fixed

- Invalid service env removed from `vercel.json`
- Rebrand leftovers: cookies, PWA screenshots, OAuth SQL

## [0.8.0] - 2026-10-13

### Added

- Platform split into apps: auth, account, studio, console, MCP and docs (#89, #94–#102)
- Marketing landing app `apps/www` and shared `@env-manager/ui` and `auth-client` packages (#95, #103)
- Docs app on Fumadocs with public search and full documentation, including an MCP usage guide (#99, #121, #125)
- Console admin app with an email allowlist, impersonation banner, admin tables and CRUD (#88, #120, #123)
- MCP server with Better Auth OAuth, scopes, Postgres rate limits and tool handlers (#87, #100, #102, #117)
- Auth consent, device code, sign-up and sign-out screens (#119)
- Support app with ticketing, FAQ and legal pages (#124)
- Page-level security guards and consistent loading, not-found, forbidden, empty and error screens in every app (#122)
- Production deploy runbook and a Turbo flag guard (#90)
- Vercel Services `vercel.json` with path-based routing

### Changed

- Better Auth upgraded to 1.7.7 (#93)
- Turbo `test` task and unit tests in CI; stable parallel Next.js builds (#110, #111)

### Fixed

- Better Auth 1.7 Drizzle schema and team columns (#108, #116)
- E2E session isolation, sign-out landing and timeline redirect (#113, #114, #115)
- Lockfile sync after the new apps were added (#112)

## [0.7.1] - 2026-10-13

### Added

- `project.unarchive` canonical action (#92)
- `a11y` task registered in turbo.json for CI (#91)

### Fixed

- Security: invitation notification sync authorized (#18), explicit E2E secret required (#20), soft-deleted memberships filtered (#22), `assignManager` guard scoped by project (#25), fail-closed permissions snapshot (#40), `ENCRYPTION_KEY` validated at startup (#33), GitHub OAuth credentials validated at boot (#23), `privateData` endpoint removed (#17)
- Account soft delete sets `deleted_at` (#29); sole-owner lookup without N+1 (#30); `TRPCError` for missing projects (#31); batched bulk import writes (#34); SQL aggregates for audit stats (#27, #35)
- UI QA: org switcher label (#47), stale project URLs after org switch (#46), organization roles page (#53), org edit sheet guard (#72), unsaved-changes prompts on every form (#76), sidebar footer (#79), sign-out to home (#82), layout-spacing tokens documented (#86)
- Build: `apps/web` type errors (#106) and the E2E seed import cycle (#107)

## [0.7.0] - 2026-10-13

### Added

- Notification system with polling, badges, a page and invite events, plus combined migration 0005 (#61, PR #8)
- Actions registry, audit timeline and org permissions (#49, #51)
- Soft-delete schema, helpers and gated query filters (#58)
- Owner, manager and member roles with Better Auth action guards (#42)
- Organizations module: list, hub, members, teams, invitations, roles, settings, timeline (#64)
- Account settings with six Better Auth tabs (#65)
- Variables v2 add and edit sheets with provenance (#71)
- Faceted table filters, unsaved-changes guard on forms, shared confirm and toast helpers (#75, #76)
- `db:reset-seed` script and production reset docs (#84)
- Platform plan for auth, account, studio, docs, console and MCP apps with recorded decisions (#94)

### Fixed

- Security: authorization no longer depends on the audit flag, project access follows org RBAC, environment, variable and project mutations are guarded, and secret values are left out of audit logs (#11–#16, #26)
- Org invites use the manager role, the active org is set on session create, auth redirects are faster, and the notification unread count matches the list

## [0.6.0] - 2026-10-13

### Added

- coss ui on Base UI with TanStack DataTable, Frame layouts and inset sheets
- FormSheet wrapper, shared PageHeader with back button, StatCard rows with real counts (PR #6)
- Canonical Lucide icon map (PR #6)
- Unified 404 and error states, consistent empty states
- Projects grid and list views with filters; split project overview and environments routes (#69, #74)
- Local E2E auth and a Playwright requirements audit suite with axe checks

### Changed

- shadcn preset adopted, then the UI migrated from Radix to coss ui on Base UI
- Dashboard, project detail, sidebar and landing redesigned on the coss layout; environment tabs and tables unified (PR #5)

### Fixed

- Layout, spacing, mobile header and table action fixes from production design reviews

## [0.5.0] - 2026-10-12

### Added

- Organization foundation behind a feature flag (migration-safe), org settings, switcher, delete and leave
- Shared patterns, error boundaries, loading states and accessibility improvements

### Fixed

- Dashboard QA: project slugs and errors, env vars security and validation, edit dialogs, responsive overflow, touch targets

### Changed

- README covers the monorepo setup and env configuration

## [0.4.0] - 2026-02-05

### Added

- Full create, edit and delete for projects, environments and variables
- Dashboard with a personalized welcome and charts
- Footer component and navigation updates

### Fixed

- Next.js 16 build and lint compatibility
- Sidebar active state for nested routes
- TypeScript build errors in hooks; variable table CRUD

## [0.3.0] - 2026-02-02

### Added

- shadcn/ui component library and a modern layout system

### Changed

- Web app refactored into a domain-driven structure

## [0.2.0] - 2026-01-19

### Added

- Environment management core: projects, environments and variables schema, API routers and migrations
- Environment management dashboard with bulk import and export, search and filters
- Audit search with strict typing
- Landing page and authentication UI improvements

### Changed

- Replaced the starter todo demo with the environment manager

## [0.1.0] - 2026-01-19

### Added

- Initial env-manager monorepo from Better-T-Stack: Next.js, tRPC, Drizzle with PostgreSQL, Better Auth, TailwindCSS and shadcn/ui, Biome, Husky, PWA support and Turborepo
- Version management and commit workflow scripts
- `SKIP_ENV_VALIDATION` option for builds

[Unreleased]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.13...HEAD
[1.19.13]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.12...v1.19.13
[1.19.12]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.11...v1.19.12
[1.19.11]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.10...v1.19.11
[1.19.10]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.9...v1.19.10
[1.19.9]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.8...v1.19.9
[1.19.8]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.7...v1.19.8
[1.19.7]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.6...v1.19.7
[1.19.6]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.5...v1.19.6
[1.19.5]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.4...v1.19.5
[1.19.4]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.3...v1.19.4
[1.19.3]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.2...v1.19.3
[1.19.2]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.1...v1.19.2
[1.19.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.19.0...v1.19.1
[1.19.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.18.0...v1.19.0
[1.18.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.17.1...v1.18.0
[1.17.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.17.0...v1.17.1
[1.17.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.16.2...v1.17.0
[1.16.2]: https://github.com/jayantrohila57/loftlancer/compare/v1.16.1...v1.16.2
[1.16.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.16.0...v1.16.1
[1.16.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.15.1...v1.16.0
[1.15.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.15.0...v1.15.1
[1.15.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.11...v1.15.0
[1.14.11]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.10...v1.14.11
[1.14.10]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.9...v1.14.10
[1.14.9]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.8...v1.14.9
[1.14.8]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.7...v1.14.8
[1.14.7]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.6...v1.14.7
[1.14.6]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.5...v1.14.6
[1.14.5]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.4...v1.14.5
[1.14.4]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.3...v1.14.4
[1.14.3]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.2...v1.14.3
[1.14.2]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.1...v1.14.2
[1.14.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.14.0...v1.14.1
[1.14.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.13.3...v1.14.0
[1.13.3]: https://github.com/jayantrohila57/loftlancer/compare/v1.13.2...v1.13.3
[1.13.2]: https://github.com/jayantrohila57/loftlancer/compare/v1.13.1...v1.13.2
[1.13.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.13.0...v1.13.1
[1.13.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.12.6...v1.13.0
[1.12.6]: https://github.com/jayantrohila57/loftlancer/compare/v1.12.5...v1.12.6
[1.12.5]: https://github.com/jayantrohila57/loftlancer/compare/v1.12.4...v1.12.5
[1.12.4]: https://github.com/jayantrohila57/loftlancer/compare/v1.12.3...v1.12.4
[1.12.3]: https://github.com/jayantrohila57/loftlancer/compare/v1.12.2...v1.12.3
[1.12.2]: https://github.com/jayantrohila57/loftlancer/compare/v1.12.1...v1.12.2
[1.12.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.12.0...v1.12.1
[1.12.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.11.1...v1.12.0
[1.11.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.11.0...v1.11.1
[1.11.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.10.0...v1.11.0
[1.10.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.9.1...v1.10.0
[1.9.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.7.1...v1.8.0
[1.7.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.6.4...v1.7.0
[1.6.4]: https://github.com/jayantrohila57/loftlancer/compare/v1.6.3...v1.6.4
[1.6.3]: https://github.com/jayantrohila57/loftlancer/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/jayantrohila57/loftlancer/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/jayantrohila57/loftlancer/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/jayantrohila57/loftlancer/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.10.0...v1.0.0
[0.10.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/jayantrohila57/loftlancer/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jayantrohila57/loftlancer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jayantrohila57/loftlancer/releases/tag/v0.1.0
