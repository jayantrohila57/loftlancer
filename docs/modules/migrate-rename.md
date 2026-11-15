# Modules — migrate or rename

1. Rename `modules/<old-slug>/` → `modules/<new-slug>/`; update file prefixes.
2. Update app path aliases and `modules/<slug>/tsconfig.json` paths.
3. Update root `tsconfig.json` `references` if path changed.
4. Run `pnpm typecheck`.
