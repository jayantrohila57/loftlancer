"use client";

import { performPlatformSignOut } from "@loftlancer/ui/platform-sign-out";
import type { QueryClient } from "@tanstack/react-query";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { authClient } from "@/lib/auth-client";

/**
 * Get current session with loading state
 */
export function useSession() {
  return authClient.useSession();
}

/**
 * Sign out, clear client caches, and return to the public home landing.
 */
export async function performSignOut(options: {
  queryClient: QueryClient;
  router: AppRouterInstance;
  returnTo?: string;
}): Promise<void> {
  const { queryClient, returnTo } = options;

  await performPlatformSignOut({
    onClearClient: () => queryClient.clear(),
    signOutLocal: () => authClient.signOut(),
    returnTo,
  });
}

/** @deprecated Use performSignOut with queryClient and router */
export async function signOut(
  onSuccess: () => void,
  onError: (error: Error) => void,
) {
  try {
    await authClient.signOut(
      {},
      {
        onSuccess,
        onError: () => {},
      },
    );
  } catch (error) {
    onError(error as unknown as Error);
  }
}
