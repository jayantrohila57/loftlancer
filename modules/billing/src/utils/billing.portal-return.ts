export const BILLING_PORTAL_LAUNCH_STORAGE_KEY =
  "loftlancer.billing.portal_launch_pending"

export function markBillingPortalLaunch() {
  try {
    sessionStorage.setItem(BILLING_PORTAL_LAUNCH_STORAGE_KEY, "1")
  } catch {
    // Session storage may be unavailable in some embeds.
  }
}

export function consumeBillingPortalLaunchPending(): boolean {
  try {
    const pending = sessionStorage.getItem(BILLING_PORTAL_LAUNCH_STORAGE_KEY)
    if (!pending) return false
    sessionStorage.removeItem(BILLING_PORTAL_LAUNCH_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
