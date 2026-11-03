import {
  type AuthSession,
  getSessionActiveOrganizationId,
} from "@loftlancer/better-auth/session-types";
import { setRequestIdentity } from "@loftlancer/sentry";

/** Sentry user + org tags for the current request, ids only (#354). */
export function tagRequestIdentity(session: AuthSession | null): void {
  setRequestIdentity({
    userId: session?.user?.id ?? null,
    orgId: session ? getSessionActiveOrganizationId(session) : null,
  });
}
