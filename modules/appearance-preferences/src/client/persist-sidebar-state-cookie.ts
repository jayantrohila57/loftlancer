import { createRuntimeLogger } from "@packages/logger"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

type SidebarOpenState = "expanded" | "collapsed"

/** Persists sidebar open state for the account shell (Cookie Store API with cookie fallback). */
export function persistSidebarStateCookie(state: SidebarOpenState): void {
  if (typeof document === "undefined") return

  const open = state === "expanded"
  const cookieStoreApi = (
    globalThis as typeof globalThis & {
      cookieStore?: {
        set: (init: {
          expires: number
          name: string
          path: string
          value: string
        }) => Promise<void>
      }
    }
  ).cookieStore

  if (cookieStoreApi) {
    void cookieStoreApi
      .set({
        expires: Date.now() + SIDEBAR_COOKIE_MAX_AGE * 1000,
        name: SIDEBAR_COOKIE_NAME,
        path: "/",
        value: String(open),
      })
      .catch(() => {
        createRuntimeLogger({
          app: "auth",
          module: "appearance-preferences",
        }).error("browser.sidebar_persist.failed", { outcome: "error" })
      })
    return
  }

  // biome-ignore lint/suspicious/noDocumentCookie: fallback when Cookie Store API is unavailable
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${String(open)}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
}
