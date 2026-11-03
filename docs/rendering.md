# Rendering (server pages → components)

How **pages and components** compose: server-first data, **logic in functions**, **components render values only**, **client islands** via `next/dynamic` + skeletons.

Related: [modules.md](./modules.md), [layouts.md](./layouts.md), [server-api.md](./server-api.md).

---

## Full page tree (layouts + rendering)

```text
Tier 1 StudioShellLayout          sidebar + inset + header ([layouts.md](./layouts.md))
  └── Tier 2 ModuleSectionLayout    sub-header (tabs optional); stable for child routes
        └── apps/…/page.tsx         import + call module server loader
              └── module RSC + dynamic client islands ([rendering.md](./rendering.md))
```

---

## Core rule

**Components render the final value. They do not own business logic, fetching, or state machines.**

| Do in **functions** (server or hook modules) | Do in **components**                            |
| -------------------------------------------- | ----------------------------------------------- |
| Fetch, parse, authorize (server)             | Layout, copy, formatting already-resolved props |
| oRPC queries/mutations (hooks)               | Bind props to UI primitives                     |
| Filters, tabs, sort state (hook functions)   | Show `viewState` / `data` / `label` passed in   |
| Map errors → `ViewState`                     | Switch UI by **passed** status, minimal glue    |

---

## Page stack

```text
apps/…/page.tsx                    # import + call only (bare)
    ↓
module/…/server/page/…             # optional: orchestrate server fetches
    ↓
module/…/client/…/rsc/…            # server page component (default)
    ↓
pass serializable props → child components (server or client)
```

1. **Server page** loads data when the route needs it (direct server calls or module `server/page` helpers).
2. **Pass data down** as props — do not require the whole screen to be `"use client"` because one button needs interactivity.
3. **Mixed trees are normal:** static text/structure = Server Component; interactive slices = **dynamically loaded** client components (see below).

---

## Logic wrappers (single or multiple functions)

Before rendering children, run **one or more functions** that return **only what the child needs**:

```text
loadX()     → { data, viewState }   // server: query + status mapping
useX()      → { data, viewState, actions }   // client: oRPC + UI state
applyFilter(items, filter) → filteredItems   // pure or hook-backed
```

**Child component signature:** receives `data`, `viewState`, `onSubmit`, etc. — not raw `fetch`, not service imports.

- **Whole query + state logic** lives inside `loadTeamOverview()` or `useTeamOverview()` — not split across JSX and `useEffect`.
- **Filter / sort / pagination** — dedicated hook or pure function; component receives `items` already filtered or `{ filter, setFilter, rows }` from the hook module.

---

## Server vs client per **slice** (not per page)

Do **not** decide “this page is client” vs “server” upfront.

| Slice                                          | Typical kind                     | Example                                      |
| ---------------------------------------------- | -------------------------------- | -------------------------------------------- |
| Page shell, headings, static copy, layout      | Server Component                 | Team overview title, description             |
| Card chrome (border, header, static body text) | Server Component                 | Project card frame                           |
| Button, form, menu, drag, optimistic UI        | Client Component                 | “Delete team”, inline edit                   |
| List that only displays server-fetched rows    | Server Component                 | Read-only member list                        |
| List with client-side filter on cached data    | Client hook + small client table | Filter fn in hook; table renders `rows` prop |

A **card** can be mostly server-rendered; only the **interactive corner** is a client island.

---

## Client islands: `dynamic()` + skeleton (required pattern)

Any **client component nested inside a server component** must be loaded with **Next.js code splitting**:

```tsx
import dynamic from "next/dynamic";
import { Card, CardHeader, CardContent } from "@loftlancer/ui/…";
import { TeamActionsSkeleton } from "../skeletons/client.team-actions.skeleton";

const TeamActions = dynamic(
  () => import("../components/client.team-actions").then((m) => m.TeamActions),
  { loading: () => <TeamActionsSkeleton /> },
);

export function TeamCard({ team }: { team: TeamCardDto }) {
  return (
    <Card>
      <CardHeader>{team.name}</CardHeader>
      <CardContent>
        <p>{team.description}</p>
        <TeamActions teamId={team.id} canManage={team.canManage} />
      </CardContent>
    </Card>
  );
}
```

**Rules:**

- **Server parent** owns structure and static content.
- **Client child** is always **`dynamic(..., { loading: () => <Skeleton /> })`** — skeleton matches the slot size (e.g. button row, not full page unless intended).
- Prefer **PPR / streaming** where the app config allows: server shell paints first; client island streams in when loaded.
- Do **not** statically import `"use client"` heavy trees into server files without `dynamic()` ( hurts bundle and breaks the island model).

Skeletons live in `module/<feature>/client/…/skeletons/` with prefix `client.*.skeleton.tsx`.

---

## Data flow summary

```text
Server page function
  → loadData() returns { items, viewState }
  → <ServerLayout viewState={viewState}>
       <StaticIntro text={…} />
       <DynamicClientPanel initial={items} />  // dynamic + skeleton
     </ServerLayout>

Client hook module (inside dynamic panel)
  → usePanel(initial) → { data, viewState, mutate }
  → <PanelBoundary state={viewState}>
       <PanelContent data={data} onSave={mutate} />
     </PanelBoundary>
```

- **Initial route data:** server function → props.
- **Follow-up fetch / mutations:** oRPC in **hooks** inside client islands; still **no logic in presentational components**.

---

## ViewState and boundaries

Functions return **`viewState`** (`loading` | `success` | `empty` | `error` | `failed`) from [modules.md](./modules.md).

- **Boundary component** (`client.*.boundary.tsx`): only switches on `viewState` + renders children or Empty/Error UI.
- **Content component**: assumes `success` + `data` props (or gets them from boundary as render props).

---

## Anti-patterns

- Page or card component that calls oRPC, runs filters, and renders JSX in one file.
- Full route marked `"use client"` because of one button.
- Client component imported statically from a server component without `dynamic` + skeleton.
- Passing server-only modules or non-serializable values as props to client children.
- Duplicating permission checks in UI that contradict server (use `useCan` for **display** only; enforcement stays on server/oRPC).

---

## Checklist (new screen)

- [ ] Server page / `server/page` loader functions return DTOs + optional `viewState`.
- [ ] Presentational components receive resolved props only.
- [ ] Filters/state in hooks or pure functions, not inline in JSX.
- [ ] Each client island: `dynamic()` + matching skeleton.
- [ ] oRPC hooks colocated in `client/…/hooks/`; forms use `utils/validation`.
- [ ] App `page.tsx` imports and calls module only.

---

## Related

- [modules.md](./modules.md) — module folders, naming
- [ui-ux-skills.md](./ui-ux-skills.md) — agent skills before building UI
- [server-api.md](./server-api.md) — server entrypoints, bare `app/`
