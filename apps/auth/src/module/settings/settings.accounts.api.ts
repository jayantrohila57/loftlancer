"use client";
import { authClient } from "@/lib/auth-client";

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
