# Package `observability`

OpenTelemetry tracing for Node server runtimes. Folder **`observability`** → **`@packages/observability`**.

| Export                                      | Use                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `@packages/observability`                   | `withSpan`, `getObservabilityTracer`, `observabilityLogFields` (`@opentelemetry/api` only) |
| `@packages/observability/instrument-server` | `initOpenTelemetryServer` — call from each app's `instrumentation.ts` `register` on Node   |

**Env:** `src/config/observability.config.ts` reads tracing vars from `process.env` (not `@packages/t3-env/server`) so Edge instrumentation does not load dotenv.

**Sentry worker (future):** set `OBSERVABILITY_TRACING_PROVIDER=sentry` so this package does not start the OTel `NodeSDK`. Wire Sentry in `register` after (or instead of) OTel, and pass `beforeSdkStart: () => false` or use the shared provider flag. Do **not** enable both full Node auto-instrumentation stacks without an explicit hook.

**MUST NOT** import SDK packages from apps — use `instrument-server` from `instrumentation.ts` only.
