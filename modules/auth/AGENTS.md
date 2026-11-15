# Module `auth`

Sign-in and post-auth stub screens. **Docs:** [../../docs/work/requirements/better-auth.md](../../docs/work/requirements/better-auth.md) · **UI rules:** [../../docs/modules/organism-components.md](../../docs/modules/organism-components.md)

**MUST** use `@packages/better-auth/client` for session/sign-in — **MUST NOT** import `better-auth` in this module.

Apps re-export screens from `[lang]/(auth)/` routes only (`export default Screen`, no props).

## Tree

```text
modules/auth/src/
├── index.ts                 # public exports only
├── utils/
│   └── auth.client-error.ts
├── client/
│   ├── hooks/               # module-wide (locale, app base path, session)
│   └── components/
│       ├── account/
│       ├── check-email/
│       ├── welcome/
│       └── sign-in/         # colocate sign-in hooks, icons, leaves
│           ├── auth.sign-in-layout.ts
│           ├── auth.sign-in-screen.tsx
│           ├── hooks/
│           ├── icons/
│           ├── google/
│           ├── github/
│           └── magic-link/
```

Filenames **MUST** use the `auth.` prefix ([tree-and-scaffold.md](../../docs/modules/tree-and-scaffold.md)). Sign-in-only hooks/icons **MUST NOT** live at `src/client/hooks/` root except module-wide hooks listed above.
