# Packages — new package

Classify: [../workflow/01-classify.md](../workflow/01-classify.md).

1. Scaffold `packages/<slug>/` per [tree-and-scaffold.md](./tree-and-scaffold.md).
2. Ensure workspace membership (pnpm `packages/*`).
3. Add `"@packages/<slug>": "workspace:*"` in consumers.
4. Elsewhere **MUST** import only `@packages/<slug>` — never deep paths.

Verify: [../verify/commands.md](../verify/commands.md).
