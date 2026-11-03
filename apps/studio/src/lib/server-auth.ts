import "server-only";

import { enrichSessionUserRole } from "@loftlancer/orpc/enrich-session-user";
import { tagRequestIdentity } from "@loftlancer/orpc/request-identity";
import { headers } from "next/headers";
import { cache } from "react";
import { siblingAuth } from "@/lib/sibling-auth";

/** Per-request cached session (avoids duplicate auth round-trips in RSC). */
export const getServerSession = cache(async () => {
  const headerList = await headers();
  const session = await enrichSessionUserRole(
    await siblingAuth.api.getSession({ headers: headerList }),
  );
  tagRequestIdentity(session);
  return session;
});

export async function getServerRequestHeaders() {
  return headers();
}
