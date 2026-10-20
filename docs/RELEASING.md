# Releasing Loftlancer

Loftlancer ships as **one product with one version**: the `version` field in the
root `package.json`. Workspace packages are private and never published, so they
do not carry their own versions. Every production release is a `dev` → `main`
merge, and every one of them gets a version, a changelog entry, a git tag and a
GitHub Release.

## Version scheme

We follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

| Range | Meaning |
|-------|---------|
| `0.x.y` | env-manager and Collidr eras, from the first commit (`v0.1.0`) |
| `1.0.0` | The Loftlancer rebrand on `main` |
| `1.x.y` | Everything since the rebrand |

How to pick the bump for a release:

| Bump | When |
|------|------|
| **major** (`2.0.0`) | A breaking change for users or self-hosters: removed features, URL schemes that break bookmarks for everyone, required env or data migrations that need manual steps |
| **minor** (`1.9.0`) | The release adds a feature or changes behavior in a backward-compatible way |
| **patch** (`1.8.1`) | The release only fixes bugs, polishes UI or changes docs and internals |

When in doubt between minor and patch, choose minor if users can see something new.

## Day to day

Every merged change adds a line under `## [Unreleased]` in
[CHANGELOG.md](../CHANGELOG.md), in the right group (`Added`, `Changed`,
`Fixed`, `Removed`, `Security`), ending with its issue number, e.g. `(#368)`.
Write for users: what changed, not how.

## Release procedure

The GitHub Actions **Release** workflow automates the repeatable parts. From
the Actions tab, run **Release** on the default branch and choose `patch`,
`minor`, or `major`. It prepares a dated changelog/version branch from `dev`
and opens a release PR to `dev`. After that PR is reviewed and merged, the
workflow validates the version and changelog, runs the shared CI checks
(lint, route literals, typechecks, tests, and a production build) on the
integrated `dev` commit, and opens a `dev` → `main` release PR. Review and
merge that production PR to deploy. A push to `main` automatically publishes
the matching tag and GitHub Release.

The automated and manual procedures use the same release scripts. To prepare a
release locally instead, on a branch from `dev` (e.g. `chore/release-v1.9.0`), run:

   ```bash
   pnpm release:prepare minor   # or major / patch
   ```

   This bumps the root `package.json` version and turns `[Unreleased]` into
   `## [1.9.0] - YYYY-MM-DD` (IST) with compare links. Review the text.
2. Commit with `chore(release): v1.9.0` and the `Fixes #N` lines for the
   release, merge into `dev`, and push `dev`.
3. Open the release PR `dev` → `main`. CI runs `pnpm release:check`, which
   fails if the version is not above `main`'s or the changelog has no dated
   section for it.
4. Merge the PR. That push to `main` is the one production deploy.
5. Tag and publish from an up-to-date checkout (normally automated after the
   `main` merge):

   ```bash
   pnpm release:publish
   ```

   This tags `origin/main` as `vX.Y.Z` and creates the GitHub Release with the
   changelog section as its notes.

Tags and GitHub Releases never deploy: `vercel.json` enables Git deployments
for the `main` branch only, and CI does not run on tags.

The workflow uses GitHub's built-in `GITHUB_TOKEN`; it adds no repository
package dependency or long-lived personal token. PRs it creates do not trigger
another `pull_request` workflow, so it runs the shared CI workflow on `dev`
before opening the production PR. The production PR still requires a human
merge decision. Repository Actions settings must allow workflows to create
pull requests and grant the workflow the `contents: write` and
`pull-requests: write` permissions declared in the workflow.

## Where the version shows

- `/changelog` on the docs site renders straight from `CHANGELOG.md`, so the
  page and the file cannot drift.
- The docs footer and the studio sidebar show a `vX.Y.Z` badge that links to
  `/changelog`. Both read the root `package.json` at build time.
