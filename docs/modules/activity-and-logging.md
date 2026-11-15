# Activity and logging

Register supported actions in the activity registry before recording them. Create a stable action ID and a unique occurrence ID before the authoritative operation whenever the integration provides a before hook. Pass the same occurrence ID through recording, logs and retries. Never trust a client-supplied owner or actor. Log a started event only as an attempt; record success only after it is observed. For transactional writes, an activity write log does not establish that the enclosing transaction committed.

Use `@modules/activity/server` for owner-scoped activity and `@packages/logger/server` for structured Node logs. Put oRPC logging in shared procedure middleware, authentication logging in the Better Auth integration, and domain events at their owning server boundary. App routes stay thin; do not add logging wrappers to route files. Browser and Edge use the runtime-safe logger and do not use Winston.

Use validated metadata and store before/after values only for registered critical changes. Keep activity history separate from diagnostic logs and any future audit or analytics store. Apply current user and resource access to activity details and links. Never expose another owner's events.

Log oRPC inputs and outputs with the shared bounded redaction. Never intentionally log passwords, tokens, cookies, credentials, authorization headers, raw URLs with query strings, or secret-bearing error messages. Redaction is defense in depth: arbitrary free text and misleading field names can still contain secrets. Avoid passing those values to the logger. Logs can include personal and business data; restrict access, configure retention in the log destination, and do not treat browser console output as centrally collected. Do not claim a retention policy exists until one is configured and verified.

Auth database hooks reserve IDs before their underlying database operation and use the same ID in the corresponding after hook. Some operations have no endpoint context or observable before hook; record those as a documented compatibility fallback rather than claiming universal pre-action identity. Failed anonymous sign-ins cannot be attributed to an owner without verified identity. Keep auth functional if activity recording fails and log the failure without secrets.

When implementing an action, test its success, denial or failure, owner isolation, ID correlation, retries, and redaction as applicable. Verify transactions and compatibility behavior with isolated database fixtures. Never mutate an existing account in tests.
