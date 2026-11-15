# Module `help`

Account **Help & support** — static git articles and mailto contact. **Docs:** [../../docs/work/requirements/account-help-support.md](../../docs/work/requirements/account-help-support.md)

| Path                        | Role                              |
| --------------------------- | --------------------------------- |
| `src/server/help.loader.ts` | Read `content/help/{locale}/*.md` |
| `src/client/components/*`   | Help center, article, support UI  |

Shell owns the help hub overview only (`@modules/shell`).
