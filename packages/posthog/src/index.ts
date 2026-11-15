export {
  posthogEnabled,
  resolvePostHogHost,
  resolvePostHogKey,
} from "./config/posthog.config"
export {
  POSTHOG_DEFAULT_HOST,
  POSTHOG_ORGANIZATION_GROUP,
} from "./constants/posthog.constants"
export { PostHogConsentBridge } from "./integration/posthog.consent-bridge.client"
export { PostHogIdentity } from "./integration/posthog.identity.client"
export {
  applyPostHogConsent,
  callPostHog,
  captureEvent,
  identifyUser,
  loadPostHog,
  resetOrganizationGroup,
  resetPostHog,
  setOrganizationGroup,
  syncInstanceConsent,
} from "./integration/posthog.integration"
export type {
  PostHogConsent,
  PostHogEventProperties,
} from "./types/posthog.types"
