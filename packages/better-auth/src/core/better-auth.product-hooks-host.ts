import type { ActionName } from "@features/authorization/utils";

/**
 * Product callbacks invoked from Better Auth SDK hooks.
 * Implementations live in `features/authentication` / modules — register via
 * `@features/authentication/core/server/authentication.register-better-auth-product-hooks`.
 */
export type AuthAuditResult = "success" | "failure" | "denied";

export type WriteAuthAuditEventInput = {
  action: ActionName;
  result: AuthAuditResult;
  actorUserId: string;
  organizationId?: string | null;
  projectId?: string | null;
  entityId?: string | null;
  entitySlug?: string | null;
  targetUserId?: string | null;
  denialReason?: string | null;
  payload?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type OrganizationInvitationEmailInput = {
  invitationId: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
  inviterName: string;
  inviterUserId?: string;
};

export type CleanupOrganizationMemberAccessInput = {
  organizationId: string;
  userId: string;
};

export type BetterAuthProductHooks = {
  writeAuthAuditEvent: (
    input: WriteAuthAuditEventInput,
  ) => Promise<string | null>;
  sendOrganizationInvitationEmail: (
    input: OrganizationInvitationEmailInput,
  ) => Promise<void>;
  cleanupOrganizationMemberAccess: (
    input: CleanupOrganizationMemberAccessInput,
  ) => Promise<void>;
  /** Claim email-keyed in-app rows after sign-in (`features/notifications`). */
  linkPendingNotificationsForUser: (
    userId: string,
    email: string,
  ) => Promise<void>;
};

let host: BetterAuthProductHooks | null = null;

export function setBetterAuthProductHooks(next: BetterAuthProductHooks): void {
  host = next;
}

export function getBetterAuthProductHooks(): BetterAuthProductHooks {
  if (!host) {
    throw new Error(
      "BetterAuthProductHooks not registered — import @features/authentication/core/server/authentication.register-better-auth-product-hooks before using Better Auth",
    );
  }
  return host;
}
