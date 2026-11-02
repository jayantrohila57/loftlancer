import type { ActionName } from "@loftlancer/actions";

/**
 * Client breadcrumb before mutation — wire PostHog/Sentry in implementation.
 */
export function trackActionIntent(action: ActionName): void {
  void action;
}
