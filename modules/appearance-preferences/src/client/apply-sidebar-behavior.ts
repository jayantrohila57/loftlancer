import { persistSidebarStateCookie } from "./persist-sidebar-state-cookie"

export type SidebarBehaviorPreference =
  | "expanded"
  | "collapsed"
  | "remember"
  | null

/** Syncs fixed sidebar behavior to the shared `sidebar_state` cookie when applicable. */
export function applySidebarBehavior(
  behavior: SidebarBehaviorPreference
): void {
  if (behavior === "expanded" || behavior === "collapsed") {
    persistSidebarStateCookie(behavior)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sidebar-preference-change", { detail: behavior })
      )
    }
  }
}
