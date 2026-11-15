# Module `shell`

Cross-app chrome configs and wired exports. **Docs:** [../../docs/modules/internal-shared.md](../../docs/modules/internal-shared.md)

| Path                                | Role                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `client/components/shell.account-*` | Account frame, accordion, **`AccountSectionSubnav`** (wired tabs)                           |
| `utils/config/shell.account-*`      | Auth account sidebar + section tab **configs**                                              |
| `@features/shell`                   | Generic layout (`ShellLayout`, `ShellSectionLayout`), `ShellSectionSubnav`, locale switcher |

Apps wire i18n once (`AuthShellRoot`, `auth-locale-switcher.ts`). Import account chrome from **`@modules/shell`** only; keep **`@features/shell`** free of account-domain UI.
