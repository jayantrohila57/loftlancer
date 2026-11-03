# `@loftlancer/typescript-config`

Shared **TypeScript** base config for the monorepo. No product or business logic.

## Contents

| File                 | Purpose                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `tsconfig.base.json` | Strict compiler defaults + workspace path aliases (`@modules/*`, `@features/*`, `@packages/*`) |

Biome lives at the **repo root** (`biome.json`), not in this package.

## Usage

Depend on the workspace package, then extend the base:

```json
{
  "extends": "@loftlancer/typescript-config/tsconfig.base.json"
}
```

```json
{
  "devDependencies": {
    "@loftlancer/typescript-config": "workspace:*"
  }
}
```

Apps and packages that need only type-resolution of the package (via `extends`) should list it under `devDependencies`. Root and packages that already list it as a dependency may keep that placement for consistency with existing workspace wiring.

## Related

- [docs/packages.md](../../docs/packages.md)
- [docs/tooling.md](../../docs/tooling.md)
