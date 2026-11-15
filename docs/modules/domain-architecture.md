# Modules — domain architecture

**Router:** [../AGENTS.md](../AGENTS.md)

One **bounded context** per slug (`users`, `teams`, `payments`, …). Each product capability is a standalone module: **do not nest domain or submodule directories inside a module**. Group its own files by technical role. Share across modules through their public entry points. Everything for that product area lives here:

- UI tree (layouts, pages, atoms → organisms)
- Validation (shared in module)
- API stack (**oRPC**): router → controller → service → domain logic
- React Query hooks (client leaves)

Apps **only import** public exports from `src/index.ts`.

## Module slugs

| Slug                  | Typical scope                                                               |
| --------------------- | --------------------------------------------------------------------------- |
| `users`, `teams`, …   | Business domain                                                             |
| `shell` (recommended) | Cross-app chrome — header, inset shell, breadcrumb — **not** business rules |

## Docs

| Topic                                  | File                                       |
| -------------------------------------- | ------------------------------------------ |
| UI layers, server-first, client leaves | [ui-tree.md](./ui-tree.md)                 |
| API/oRPC layers                        | [api-structure.md](./api-structure.md)     |
| `shared/` inside a module              | [internal-shared.md](./internal-shared.md) |
| tsconfig + app paths                   | [wiring.md](./wiring.md)                   |

**Next:** [ui-tree.md](./ui-tree.md)
