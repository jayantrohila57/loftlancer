# Requirements first (before code)

**Previous:** [03-split.md](./03-split.md)  
**When:** Any request that is **broad**, **vague**, or **multi-layer** (e.g. “add Better Auth”, “complete the app”, “set up auth end to end”).

## Stop — do not implement yet

If the user has **not** approved a requirements doc, the agent **MUST NOT**:

- Add packages, plugins, Docker, or migrations
- Wire routes, proxy, or UI beyond what the doc lists
- Pick defaults for DB, email, SSO, or roles without explicit approval

Short, unambiguous tasks (“fix typo in X”, “rename Y to Z”) skip this doc.

## Process

1. **Classify** — [01-classify.md](./01-classify.md) (layer: packages / features / modules / apps).
2. **Discovery** — Ask end-to-end questions until the picture is clear (non-technical wording is fine; translate into technical choices in the doc).
3. **Write** — Create or update `docs/work/requirements/<slug>.md` from [../work/requirements/README.md](../work/requirements/README.md).
4. **Validate** — Walk the doc as a checklist: layers, env, UX flow, gaps, out-of-scope. **Ask** for every missing piece.
5. **Sign-off** — User confirms the doc (e.g. “approved”, “go implement”). Record approval in the doc.
6. **Implement** — Smallest slices from the doc; after each slice, **`pnpm check`**; do not expand scope without updating the doc.

## Requirements doc location

```text
docs/work/requirements/
├── README.md           # template + index
└── <slug>.md           # one active initiative (e.g. better-auth.md)
```

**Normative workflow:** this file. **Per-initiative spec:** `docs/work/requirements/<slug>.md`.

## Better Auth example (what should have happened)

Before any `@packages/better-auth` code:

| Topic    | Question                                                       |
| -------- | -------------------------------------------------------------- |
| Scope    | Auth app only, or shared package for web too?                  |
| Database | Neon, Supabase, Docker local, existing URL?                    |
| Sign-in  | Google, GitHub, magic link, password, which?                   |
| SSO      | OAuth only vs enterprise SAML/OIDC (`@better-auth/sso`)?       |
| Orgs     | Better Auth organization plugin vs app-only roles?             |
| Roles    | owner / admin / manager / member — where enforced?             |
| Email    | Resend, SES, dev console only?                                 |
| Layers   | What lives in `@packages/*` vs `@modules/auth` vs `apps/auth`? |
| UX       | Sign-in → welcome → account flow; what is protected?           |

Only after answers are in **`better-auth.md`** and approved → implementation.

**Next:** [../work/requirements/README.md](../work/requirements/README.md)
