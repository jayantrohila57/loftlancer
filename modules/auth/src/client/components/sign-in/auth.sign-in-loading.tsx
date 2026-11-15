import Shell from "@packages/ui/components/shell"
import { Skeleton } from "@packages/ui/components/skeleton"

import {
  AuthSignInMagicLinkSkeleton,
  AuthSignInSocialStackSkeleton,
} from "./auth.sign-in-skeleton"

/** Route loading fallback — avoids rendering live sign-in before provider availability is known. */
export function AuthSignInLoading() {
  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div aria-hidden className="space-y-1 text-center">
          <Skeleton className="mx-auto h-8 w-40 rounded-md" />
          <Skeleton className="mx-auto h-4 w-56 rounded-sm" />
        </div>
        <AuthSignInSocialStackSkeleton />
        <AuthSignInMagicLinkSkeleton />
      </Shell.Stack>
    </Shell.Section>
  )
}
