# Feature `command`

Unified **command palette** merging `@features/navigation` and `@features/action` registries. Rich Coss `Command` dialog (groups, icons, shortcuts, footer, empty state).

| Path                                | Role                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `utils/command.merge.ts`            | `mergeCommandPaletteFromRegistries`, `filterCommandPaletteGroups`   |
| `utils/command.merge.validation.ts` | `assertValidCommandPaletteRegistries` (cross-registry ids, nesting) |
| `utils/command.execute.ts`          | `executeCommandPaletteItem` — async `run`, optional `onRunError`    |
| `capability/command.palette.tsx`    | Client organism — `CommandPalette`                                  |

Shell hotkey wrapper: `@features/shell` → `ShellCommandMenu`.

Apps pass **`NavigationRegistry`** + **`ActionRegistry`** (built from module items + `command` placement). See `apps/studio/src/shared/shell/studio-shell-command-menu.tsx`.

**Nesting (one level):** set `parentId` on `NavigationItem` / `ActionItem` to another item’s `id` in the merged palette. Auth account command nav uses href-derived ids (`navigationIdFromHref` in `apps/auth/src/shared/shell/auth-account-command-navigation.ts`). Actions may nest under actions or navigation parents via the same id string. Optional `selectable: false` on actions renders a non-selectable header row; navigation parents stay selectable when they have `href`.
