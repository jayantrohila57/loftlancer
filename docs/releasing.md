# Releasing

This monorepo ships as **one product with one version**: the `version` field in
the root `package.json` (currently `0.0.1`). Workspace packages are private and
never published, so they do not carry the product version. Every production
release is a `dev` → `main` merge, and every one of them gets a version, a
changelog entry, a git tag (`vX.Y.Z`), and a GitHub Release. The starting tag
is `v0.0.1`.

## Version scheme

We follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

| Range   | Meaning                                   |
| ------- | ----------------------------------------- |
| `0.x.y` | Template and pre-launch iteration         |
| `1.0.0` | Reserved for the first stable product cut |

How to pick the bump for a release:

| Bump                | When                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **major** (`1.0.0`) | Reserved for the first stable product cut, or a later breaking change for users or self-hosters |
| **minor** (`0.1.0`) | The release adds a feature or changes behavior in a backward-compatible way                     |
| **patch** (`0.0.2`) | The release only fixes bugs, polishes UI, or changes docs and internals                         |

When in doubt between minor and patch, choose minor if users can see something new.

## Day to day

Add a line under `## [Unreleased]` in [CHANGELOG.md](../CHANGELOG.md) only
when the change is user-facing. Skip the changelog for refactors, internal
renames, dependency bumps, CI, tests, and other implementation-only work.

## Writing changelog entries

Write for a normal user or stakeholder: what they can do, what went away, or
what will break for them. Do not describe how the code changed.

Use only these groups:

| Group        | Use for                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| **Added**    | A new feature or capability people can use                              |
| **Removed**  | Something people could use before that is now gone                      |
| **Breaking** | An incompatible change people must act on (sign-in, URLs, required env) |
| **Changed**  | A user-visible behavior change only — not a refactor or internal rename |

`Changed` is kept for visible behavior only. Do not use `Fixed`, `Security`,
or other Keep a Changelog groups. A bug fix belongs here only when users can
see the difference; put it under **Changed**. A breaking fix belongs under
**Breaking**. End user-facing lines with the issue number when there is one,
e.g. `(#368)`.

**Do**

- Added: Team owners can invite members by email (`#368`).
- Removed: The legacy status page is no longer available (`#401`).
- Breaking: Sign-in now uses `/auth`; existing `/login` links will not work (`#410`).
- Changed: Billing invoices download as PDF instead of CSV (`#412`).

**Don't**

- Refactor the billing module into smaller services.
- Rename `feature-kit-auth` to `loftlancer-auth` in local scripts.
- Bump `next` to 16.1 and update TypeScript types.
- Fix a null check on line 84 of `prepare.mjs`.

The release scripts do not invent entries from git commits. `pnpm release:prepare`
and `pnpm release:check` reject unknown headings and empty user-facing sections.
If commit collection is added later, `chore`, `refactor`, `style`, `test`,
`ci`, `build`, and `docs` commits stay out of the changelog.

## Release procedure

The GitHub Actions **Release** workflow automates the repeatable parts. From
the Actions tab, run **Release** on the default branch and choose `patch`,
`minor`, or `major`. It prepares a dated changelog/version branch from `dev`
and opens a release PR to `dev`. After that PR is reviewed and merged, the
workflow validates the version and changelog, runs the shared Check workflow
(`pnpm check:ci`) on the integrated `dev` commit, and opens a `dev` → `main`
release PR. Review and merge that production PR to deploy. A push to `main`
automatically publishes the matching tag and GitHub Release.

This flow expects a `dev` branch on the remote (it is not created
automatically). Create it from `main` before the first automated release.

The automated and manual procedures use the same release scripts. To prepare a
release locally instead, on a branch from `dev` (e.g. `chore/release-v0.0.2`),
run:

```bash
pnpm release:prepare patch   # or minor / major
```

This bumps the root `package.json` version and turns `[Unreleased]` into
`## [0.0.2] - YYYY-MM-DD` (IST) with compare links. Review the text.

1. Commit with `chore(release): v0.0.2` and the `Fixes #N` lines for the
   release, merge into `dev`, and push `dev`.
2. Open the release PR `dev` → `main`. CI runs `pnpm release:check`, which
   fails if the version is not above `main`'s or the changelog has no dated
   section for it.
3. Merge the PR. That push to `main` is the one production deploy.
4. Tag and publish from an up-to-date checkout (normally automated after the
   `main` merge):

```bash
RELEASE_PUBLISH=1 pnpm release:publish
```

This tags `origin/main` as `vX.Y.Z` and creates the GitHub Release with the
changelog section as its notes. Local runs require `RELEASE_PUBLISH=1` or
`--confirm` so a tag is not created by accident. The workflow sets this
automatically.

Tags and GitHub Releases never deploy: `vercel.json` enables Git deployments
for the `main` branch only, and Check CI does not deploy on tags.

The workflow uses GitHub's built-in `GITHUB_TOKEN`; it adds no repository
package dependency or long-lived personal token. PRs it creates do not trigger
another `pull_request` workflow, so it runs the shared Check workflow on `dev`
before opening the production PR. The production PR still requires a human
merge decision. Repository Actions settings must allow workflows to create
pull requests and grant the workflow the `contents: write` and
`pull-requests: write` permissions declared in the workflow.

## Where the version shows

The root `package.json` version is the source of truth. Each app's
`next.config.ts` already injects it as `NEXT_PUBLIC_APP_VERSION` at build
time. A public changelog page and in-app version badge are not part of this
template yet.

## What's New (scaffolding)

The web app serves user-facing release notes at `/[lang]/whats-new`. The
page is reachable by URL and is not linked from navigation or prompted on
visit. A `WhatsNewDialog` lives in `@modules/whats-new` but is not mounted
in any layout, and `WHATS_NEW_POPUP_ENABLED` is `false`. The pop-up will be
enabled in a future release.
