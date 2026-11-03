# `@loftlancer/t3-env`

Workspace wrapper around **[`@t3-oss/env-core`](https://env.t3.gg)** / **`@t3-oss/env-nextjs`** with Zod schemas.

Validates and exposes process env for apps and packages. **No product domain logic** beyond parsing flags and shared URL/slug constants needed at the env boundary.

## Layout

```text
src/
  core/        # Zod schemas shared by createEnv configs
  config/      # createEnv modules (server + per-app client)
  constants/   # Defaults, flag pair tables, reserved slugs, base paths
  types/       # Exported types
  utils/       # Flag/url/slug helpers (read env; no business rules)
  tests/
```

Filenames are provider-prefixed (`t3-env.*`).

## Imports

```ts
import { env } from "@loftlancer/t3-env/server";
import { env as webEnv } from "@loftlancer/t3-env/web";
import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
```

Set `SKIP_ENV_VALIDATION=1` for scripted runs that only need a subset of vars.
