import type { BetterAuthDatabaseHooks as DatabaseHooks } from "@packages/better-auth"
// Public image URLs cannot establish ownership or exclusive Blob use.
// Automatic deletion remains disabled until both can be enforced safely.
export function buildProfileAuthDatabaseHooks(): DatabaseHooks {
  return {}
}
