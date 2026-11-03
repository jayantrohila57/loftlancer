"use client";

import type { LoftlancerAuthClient } from "@loftlancer/better-auth/client";
import { ImpersonationBanner } from "./authentication.impersonation-banner-ui";

type SessionPayload = {
  session?: { impersonatedBy?: string | null };
  user?: { email?: string | null; name?: string | null };
};

export function getImpersonatedByUserId(
  data: SessionPayload | null | undefined,
): string | null | undefined {
  return data?.session?.impersonatedBy ?? null;
}

/** Wires Better Auth session + admin.stopImpersonating to the design-system banner. */
export function LoftlancerImpersonationBanner({
  authClient,
}: {
  authClient: LoftlancerAuthClient;
}) {
  const { data } = authClient.useSession();
  const impersonatedBy = getImpersonatedByUserId(
    data as SessionPayload | null | undefined,
  );
  const subjectLabel = data?.user?.email ?? data?.user?.name ?? undefined;

  return (
    <ImpersonationBanner
      impersonatedByUserId={impersonatedBy}
      subjectLabel={subjectLabel}
      onStopImpersonating={() => {
        void authClient.admin.stopImpersonating({});
      }}
    />
  );
}
