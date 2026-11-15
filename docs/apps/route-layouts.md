# Apps — route layouts

**Prev:** [page-convention.md](./page-convention.md)

## Tree rule

Each route segment **MAY** have its own `layout.tsx` for a **stable frame** (inset, tabs shell). Layouts **MUST NOT** fetch domain APIs for children.

**Root / app layout** — only cross-cutting gates:

- Locale / direction (already in `[lang]/layout.tsx`)
- Session **presence** check if required (redirect) — not full session payload for UI

**Domain chrome** (sidebar, header, inset) — import from `@modules/shell` or domain module; **each sub-component owns its own data** (e.g. user menu calls session; nav items call roles API).

Under **`cacheComponents`**, per-request reads **MUST** sit in **`<Suspense>`** (or `'use cache'` when shared). See [cache-components.md](./cache-components.md).

## Example shape

```text
app/[lang]/(app)/users/
  layout.tsx    → imports UsersAreaLayout from @modules/users (frame only)
  page.tsx      → export UsersListPage
  [id]/page.tsx → export UserDetailPage
```

Children render inside **inset**; parent layout does not pass API results down as props.

**Next:** [app-shared.md](./app-shared.md)
