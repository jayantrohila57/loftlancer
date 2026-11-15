# Features — migrate or rename

1. Rename `features/<old-slug>/` → `features/<new-slug>/`; update `"name"` and file prefixes.
2. Update `"@features/<new-slug>/*"` in `tsconfig.json`.
3. Replace consumer deps/imports; run install + typecheck.
4. Remove dead paths and references.
