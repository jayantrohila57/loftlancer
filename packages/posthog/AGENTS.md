# Package `posthog`

CDN-based PostHog (no `posthog-js` npm dep). Folder **`posthog`** → **`@packages/posthog`**.

| Export              | Use                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `@packages/posthog` | `loadPostHog`, `captureEvent`, `PostHogConsentBridge`, `PostHogIdentity`, config helpers |

**Env (client, `@packages/t3-env/client`):** `NEXT_PUBLIC_POSTHOG_KEY` (gate), optional `NEXT_PUBLIC_POSTHOG_HOST`.

**Consent:** Studio wires `PostHogConsentBridge` + `usePrivacyAnalyticsConsent` from `@modules/privacy/client`. Web stays denied until a marketing consent source exists.

**MUST NOT** import PostHog in server-only secrets paths; product analytics is browser-only.
