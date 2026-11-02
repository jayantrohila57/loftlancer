---
name: "source-command-ship"
description: "Migrated source command `ship`"
---

# source-command-ship

Use this skill when the user asks to run the migrated source command `ship`.

## Command Template

# Ship my local changes

Take every uncommitted change in this repo and ship it through Loftlancer's normal flow. Read `docs/releasing.md` and `AGENTS.md` first and follow them.

1. **Survey.** Run `git status` and `git diff` (including untracked files). Group the changes by concern: one group is one logical change, such as a single UI fix or a single docs edit. Never mix unrelated changes in one group.
2. **Match an issue for each group.** Search open issues with `gh issue list --state open --search "<keywords>"` and by area labels (ui, ui-compact, auth, docs, seo, performance…). Also check existing branches with `git branch -a` and open PRs with `gh pr list` for work on the same issue.
   - If a matching open issue exists, use it. If that issue already has an open PR or branch, add the commit to that branch instead of making a new one.
   - If nothing matches, create a new issue with `gh issue create`, following `.github/ISSUE_TEMPLATE/task.yml` (or `bug.yml` for bugs). Give it a clear title, a short body, and fitting labels. Skip the `on-hold` label, and never touch on-hold issues (#221 #223 #224 #344 #350).
3. **Branch per group.** Start from an up-to-date `dev` (`git fetch origin && git switch dev && git pull`), then run `git switch -c <type>/<issue#>-<short-slug>`, where type is feat, fix, docs or chore. Carry the uncommitted changes across with `git stash` and `git stash pop`, or by staging only that group's files.
4. **Changelog.** Add one line under `## [Unreleased]` in `CHANGELOG.md`, in the right group (Added, Changed, Fixed, Removed, Security). Write it for users and end it with `(#<issue>)`.
5. **Commit.** Stage only that group's files plus the changelog line. Use a conventional commit, `<type>(<scope>): <summary>`, with `Refs #<issue>` in the body. Never use `--no-verify`; fix whatever the pre-commit hook reports. Run `pnpm check` and the affected app's typecheck first.
6. **PR into dev.** Run `git push -u origin HEAD`, then `gh pr create --base dev --title "<same as commit>" --body "Fixes #<issue>\n\n<what changed>"`. Keep one issue per PR. Never target `main`, never force-push, and never bump the version by hand.
7. **Repeat** for every group, then return to `dev` with a clean tree.
8. **Report** a short table of group, issue link, branch and PR link.

Do NOT release unless I say "release". Then, only after all the PRs are merged into dev, run `gh workflow run release.yml --ref main -f bump=patch` (use `minor` if users can see something new) and tell me that the release PR into dev, and after it the dev to main PR, need merging.

Safety: never commit `.env` files or secrets. Never run `db:push`, `db:migrate` or `db:reset-seed`, because local points at the live database.

## AI rules, skills and docs

Changes to AGENTS.md, `.cursor/rules/`, skills, `docs/` or other AI-guidance files are their own group, never mixed with code. Use type `docs` (or `chore(ai)` for rules and skills), the `documentation` label, and a Changed line in the changelog. If one rules change touches many files, keep it as one issue and one PR. Before committing, check the new rules do not contradict each other or the existing docs, and flag any conflict in the report.
