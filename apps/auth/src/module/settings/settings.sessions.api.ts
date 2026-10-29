"use client";
import { authClient } from "@/lib/auth-client";
import { withBasePath } from "@/lib/base-path";

export async function listAuthSessions() {
  const response = await fetch(withBasePath("/api/account/sessions"), {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load sessions");
  }
  return (await response.json()) as Array<{
    id: string;
    token: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
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
