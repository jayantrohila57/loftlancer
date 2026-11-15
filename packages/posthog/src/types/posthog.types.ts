export type PostHogConsent = "granted" | "denied" | "unset" | null

export type PostHogEventProperties = Record<string, string | number | boolean>

export type PostHogHost = { posthog?: PostHogLike }

type PostHogStub = unknown[] & { _i?: unknown[]; people?: unknown[] }
type PostHogLike = PostHogStub | Record<string, unknown>

export type PostHogInstance = {
  has_opted_out_capturing?: () => boolean
  opt_in_capturing?: (options?: { captureEventName?: false }) => void
  opt_out_capturing?: () => void
}

export type { PostHogLike, PostHogStub }
