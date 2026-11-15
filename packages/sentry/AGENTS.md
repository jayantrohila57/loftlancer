# Package `sentry`

Sentry instrumentation helpers + shared JSON logger sink. Folder **`sentry`** → **`@packages/sentry`**.

| Export                                | Use                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `@packages/sentry`                    | `logger`, `errorAttributes`, `setRequestIdentity`                                 |
| `@packages/sentry/instrument`         | Server/edge `buildSentryInitOptions`, `initSentryEdge` — `instrumentation.ts`     |
| `@packages/sentry/instrument-browser` | Client `buildSentryInitOptions`, `wireSentryLogger` — `instrumentation-client.ts` |
| `@packages/sentry/instrument-server`  | `initAndWireSentryServer` — Node runtime in `instrumentation.ts`                  |
| `@packages/sentry/next-config`        | `createSentryBuildOptions`, `readMonorepoAppVersion` — `next.config.ts`           |
| `@packages/sentry/test`               | Sentry test-error route guards (optional)                                         |
| `@packages/sentry/test-route`         | Shared `/api/sentry-test` GET/POST handler                                        |
| `@packages/sentry/identity`           | Client `SentryIdentity` — session user id + org tag                               |

Apps depend on `@sentry/nextjs` and wire entrypoints only; packages log through `logger` here.
