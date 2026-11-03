import type { ActionName } from "@features/authorization/utils";
/** App instrumentation can subscribe without coupling modules to a telemetry vendor. */
export function trackActionIntent(action: ActionName): void {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("loftlancer.action.intent", { detail: { action } }),
    );
}
