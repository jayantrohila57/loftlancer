# Agent router

**All normative docs:** [docs/README.md](docs/README.md) (single index — do not use removed `{layer}/docs/` paths).

[docs/layers.md](docs/layers.md) · [docs/verify/commands.md](docs/verify/commands.md)

**New work:** [docs/workflow/01-classify.md](docs/workflow/01-classify.md) → **`{layer}/AGENTS.md`** → **`docs/{layer}/`**.

**Finish:** `pnpm check` · **Codex:** [CODEX.md](CODEX.md) · **Rules index:** [.cursor/rules/README.md](.cursor/rules/README.md)


## Versioning & releases

- One product version in the root `package.json` (currently `0.0.1`; tags are `vX.Y.Z`, starting at `v0.0.1`).
- Add a line under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md) only for user-facing **Added**, **Removed**, or **Breaking** changes (and **Changed** only when users can see a behavior change). Skip refactors, dependency bumps, and implementation detail.
- Release procedure and writing examples: [docs/releasing.md](docs/releasing.md#writing-changelog-entries).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
