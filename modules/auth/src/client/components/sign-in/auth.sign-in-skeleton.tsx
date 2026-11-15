import { Skeleton } from "@packages/ui/components/skeleton"

import { authSignInLayout } from "./auth.sign-in-layout"

/** Placeholder for one outline social `Button` (Google / GitHub). */
export function AuthSignInSocialSkeleton() {
  return (
    <Skeleton aria-hidden className={authSignInLayout.outlineButtonSkeleton} />
  )
}

/** Placeholder for `AuthMagicLinkForm` (email field + submit). */
export function AuthSignInMagicLinkSkeleton() {
  const { form, field, inputSkeleton, labelSkeleton, submitSkeleton } =
    authSignInLayout.magicLink

  return (
    <div aria-hidden className={form}>
      <div className={`flex ${field}`}>
        <Skeleton className={labelSkeleton} />
        <Skeleton className={inputSkeleton} />
      </div>
      <Skeleton className={submitSkeleton} />
    </div>
  )
}

/** Both social buttons while chunks load (optional combined fallback). */
export function AuthSignInSocialStackSkeleton() {
  return (
    <div aria-hidden className={authSignInLayout.socialStack}>
      <AuthSignInSocialSkeleton />
      <AuthSignInSocialSkeleton />
    </div>
  )
}
