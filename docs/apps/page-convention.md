# Apps — page convention

**Prev:** [routing-shell.md](./routing-shell.md)

Every route **`page.tsx`** **MUST** default-export a module screen (or a thin async wrapper that only sets metadata and re-exports).

```tsx
import { UsersHomePage } from "@modules/users"

export default UsersHomePage
```

**MAY** in the same file (only):

- `generateMetadata` / `metadata`
- `generateStaticParams` when required
- Auth / role / permission checks that belong to **routing** (or delegate to module helper imported as one call)

**MUST NOT** fetch domain data, define forms, or compose large JSX in `page.tsx`.

Hooks for API calls live in **modules**; the exported page coordinates server-first tree and passes data **inside the module**, not via the app file.

**Next:** [app-shared.md](./app-shared.md)
