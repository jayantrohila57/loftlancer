# `@loftlancer/better-auth`

Better Auth **SDK integration** — instance factories, adapters, session cookies, rate-limit storage, CORS helpers, and platform middleware. No product domain rules live here.

## Layout

```text
src/
  core/       # SDK init, adapters, plugins, guards, product-hooks host
  config/     # Platform URL defaults / production origins
  types/      # Session types
  utils/      # return_to validation
  index.ts
tests/
```

## Product hooks

Organization invitation email, auth-lifecycle audit writes, and member-access cleanup are registered from **`@features/authentication/core/server/authentication.register-better-auth-product-hooks`** into `better-auth.product-hooks-host`. Import that module before handling Better Auth requests (apps / bootstrap).

Member-removal **policy** lives in **`module/organizations/utils/utils.member-removal-policy.ts`**.

## TODO (blocked)

- Further extract org-plugin domain hooks still embedded in `core/better-auth.shared.ts` (archived-org guards, invitation accept scoping, joinedAt side effects) into `features/authentication` once a stable host surface exists — keep SDK plugin wiring here.
