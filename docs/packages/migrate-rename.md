# Packages — migrate or rename

1. Rename `packages/<old-slug>/` → `packages/<new-slug>/`; update `"name"` and file prefixes.
2. Update `"@packages/<new-slug>/*"` in `tsconfig.json`.
3. Replace consumer deps and imports.
4. Run workspace install and typecheck across affected packages.
5. Remove dead references.
