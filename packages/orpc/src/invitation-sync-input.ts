import type { RequireActionContext } from "./actions/require-action";

export function organizationIdFromInviteSyncInput(
  input: unknown,
): Partial<RequireActionContext> {
  if (!input || typeof input !== "object") {
    return {};
  }
  const record = input as Record<string, unknown>;
  if (typeof record.organizationId === "string") {
    return { organizationId: record.organizationId };
  }
  return {};
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}
