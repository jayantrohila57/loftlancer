import { resolvePostHogHost, resolvePostHogKey } from "../config/posthog.config"
import { POSTHOG_ORGANIZATION_GROUP } from "../constants/posthog.constants"
import type {
  PostHogConsent,
  PostHogEventProperties,
  PostHogHost,
  PostHogInstance,
  PostHogStub,
} from "../types/posthog.types"

export { POSTHOG_ORGANIZATION_GROUP }

const OPT_IN_OPTIONS = { captureEventName: false } as const

let consentGranted = false

function defaultHost(): PostHogHost | undefined {
  return typeof window === "undefined"
    ? undefined
    : (window as unknown as PostHogHost)
}

/**
 * Calls a PostHog method. Before array.js has loaded, `window.posthog` is the
 * snippet stub; calls queue until the library initialises. Without PostHog this
 * does nothing.
 */
export function callPostHog(
  method: string,
  args: unknown[],
  host: PostHogHost | undefined = defaultHost()
): void {
  const instance = host?.posthog
  if (!instance) return
  const fn = (instance as Record<string, unknown>)[method]
  if (typeof fn === "function") {
    try {
      fn.apply(instance, args)
    } catch {
      // Analytics must never break the app.
    }
    return
  }
  if (Array.isArray(instance)) instance.push([method, ...args])
}

export function identifyUser(userId: string, host?: PostHogHost): void {
  callPostHog("identify", [userId], host ?? defaultHost())
}

export function setOrganizationGroup(orgId: string, host?: PostHogHost): void {
  callPostHog(
    "group",
    [POSTHOG_ORGANIZATION_GROUP, orgId],
    host ?? defaultHost()
  )
}

export function resetOrganizationGroup(host?: PostHogHost): void {
  callPostHog("resetGroups", [], host ?? defaultHost())
}

export function resetPostHog(host?: PostHogHost): void {
  callPostHog("reset", [], host ?? defaultHost())
}

export function captureEvent(
  event: string,
  properties?: PostHogEventProperties,
  host?: PostHogHost
): void {
  callPostHog(
    "capture",
    properties ? [event, properties] : [event],
    host ?? defaultHost()
  )
}

export function syncInstanceConsent(
  instance: PostHogInstance,
  granted: boolean
): void {
  try {
    if (!granted) {
      instance.opt_out_capturing?.()
    } else if (instance.has_opted_out_capturing?.()) {
      instance.opt_in_capturing?.(OPT_IN_OPTIONS)
    }
  } catch {
    // Analytics must never break the app.
  }
}

function stubOptedOut(stub: unknown[]): boolean {
  for (let i = stub.length - 1; i >= 0; i--) {
    const item = stub[i]
    if (!Array.isArray(item)) continue
    if (item[0] === "opt_out_capturing") return true
    if (item[0] === "opt_in_capturing") return false
  }
  return false
}

export function applyPostHogConsent(
  consent: PostHogConsent,
  host: PostHogHost | undefined = defaultHost()
): void {
  if (consent === null) return
  consentGranted = consent === "granted"
  const instance = host?.posthog
  if (!instance) {
    if (consentGranted) loadPostHog()
    return
  }
  if (Array.isArray(instance)) {
    if (!consentGranted) instance.push(["opt_out_capturing"])
    else if (stubOptedOut(instance))
      instance.push(["opt_in_capturing", OPT_IN_OPTIONS])
    return
  }
  syncInstanceConsent(instance as PostHogInstance, consentGranted)
}

export function loadPostHog(): void {
  const posthogKey = resolvePostHogKey()
  const posthogHost = resolvePostHogHost()
  if (!posthogKey || typeof window === "undefined") return
  const w = window as unknown as { posthog?: PostHogStub }
  if (w.posthog) return
  consentGranted = true
  const stub: PostHogStub = []
  stub.people = []
  stub._i = [
    [
      posthogKey,
      {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: "history_change",
        session_recording: { maskAllInputs: true },
        loaded: (instance: PostHogInstance) =>
          syncInstanceConsent(instance, consentGranted),
      },
    ],
  ]
  w.posthog = stub
  const script = document.createElement("script")
  script.async = true
  script.crossOrigin = "anonymous"
  script.src = `${posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com")}/static/array.js`
  document.head.appendChild(script)
}
