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

export async function updateProfile(input: { name?: string; image?: string }) {
  const result = await authClient.updateUser(input);
  if (result.error) {
    throw new Error(result.error.message ?? "Could not update profile");
  }
  return result.data;
}

export async function listAuthSessions() {
  const result = await authClient.listSessions();
  if (result.error) {
    throw new Error(result.error.message ?? "Could not load sessions");
  }
  return result.data ?? [];
}

export async function revokeAuthSession(token: string) {
  const result = await authClient.revokeSession({ token });
  if (result.error) {
    throw new Error(result.error.message ?? "Could not revoke session");
  }
  return result.data;
}

export async function revokeOtherAuthSessions() {
  const result = await authClient.revokeOtherSessions();
  if (result.error) {
    throw new Error(result.error.message ?? "Could not revoke other sessions");
  }
  return result.data;
}

export type LinkableProvider = "github" | "google";

/** Link another sign-in provider to the signed-in account (redirects). */
export async function linkSocialAccount(provider: LinkableProvider) {
  const callbackURL =
    typeof window !== "undefined"
      ? `${window.location.origin}/settings/accounts`
      : "/settings/accounts";
  const result = await authClient.$fetch("/link-social", {
    method: "POST",
    body: {
      provider,
      callbackURL,
    },
  });
  if (result.error) {
    throw new Error(result.error.message ?? `Could not link ${provider}`);
  }
  return result.data;
}

export async function unlinkProviderAccount(accountId: string) {
  const result = await authClient.unlinkAccount({ accountId });
  if (result.error) {
    throw new Error(result.error.message ?? "Could not unlink account");
  }
  return result.data;
}
