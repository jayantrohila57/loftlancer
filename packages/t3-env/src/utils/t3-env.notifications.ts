/** In-app + email notification delivery (see docs/database.md feature flags). */
export function isNotificationsEnabled(): boolean {
  return process.env.NOTIFICATIONS_ENABLED === "true";
}

export function isNotificationsEnabledOnClient(): boolean {
  return process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === "true";
}
