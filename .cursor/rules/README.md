# Cursor rules index

Codex: read each **`*.mdc`** below before editing matching paths (not auto-loaded).

| File                                                               | When                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [always-routing.mdc](./always-routing.mdc)                         | Always                                                                |
| [multitask-subagent-tabs.mdc](./multitask-subagent-tabs.mdc)       | Always — Task links; no build/check unless user asks                  |
| [form-kit.mdc](./form-kit.mdc)                                     | Always — forms and fields                                             |
| [requirements-first.mdc](./requirements-first.mdc)                 | Always — vague / multi-step                                           |
| [typescript-no-any.mdc](./typescript-no-any.mdc)                   | Any TS                                                                |
| [typescript-named-props.mdc](./typescript-named-props.mdc)         | Components / routes                                                   |
| [apps-import-aliases.mdc](./apps-import-aliases.mdc)               | `apps/**/src/**`                                                      |
| [packages-ui-tsconfig.mdc](./packages-ui-tsconfig.mdc)             | `@packages/ui` imports                                                |
| [next-proxy-file.mdc](./next-proxy-file.mdc)                       | `apps/**/proxy.ts`                                                    |
| [next-lang-routes.mdc](./next-lang-routes.mdc)                     | `apps/**/app/**`                                                      |
| [theme-provider.mdc](./theme-provider.mdc)                         | Theme / mode toggle                                                   |
| [ui-shadcn.mdc](./ui-shadcn.mdc)                                   | `packages/ui/**`                                                      |
| [biome-tailwind.mdc](./biome-tailwind.mdc)                         | Tailwind class sorting                                                |
| [i18n-app-files.mdc](./i18n-app-files.mdc)                         | `apps/**/shared/i18n/**`                                              |
| [i18n-imports.mdc](./i18n-imports.mdc)                             | i18n TS + `features/i18n/**`                                          |
| [i18n-proxy.mdc](./i18n-proxy.mdc)                                 | `apps/**/proxy.ts` + i18n                                             |
| [app-routing-shell.mdc](./app-routing-shell.mdc)                   | App routes → modules only                                             |
| [shell-layout.mdc](./shell-layout.mdc)                             | `Shell` + sidebar chrome                                              |
| [auth-shell-compound.mdc](./auth-shell-compound.mdc)               | Auth app + account modules — **MUST** use `Shell.*` compound regions  |
| [shell-dashboard-scroll.mdc](./shell-dashboard-scroll.mdc)         | `ShellLayout` + `ShellSectionLayout` — fixed chrome, page scroll only |
| [module-domain-architecture.mdc](./module-domain-architecture.mdc) | `modules/**`                                                          |
| [activity-and-logging.mdc](./activity-and-logging.mdc)             | Activity, actions, auth, and logging                                  |
| [module-organism-components.mdc](./module-organism-components.mdc) | `modules/**/screens`, `hooks`, `icons` — **follow when building UI**  |

Normative prose: **`docs/`** only (see [docs/README.md](../../docs/README.md)). Layer **`AGENTS.md`** files are pointers. Rules here are reminders only.
