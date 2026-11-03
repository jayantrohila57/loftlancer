import "server-only";

import { tagRequestIdentity } from "@loftlancer/orpc/request-identity";
import { headers } from "next/headers";
import { cache } from "react";
import { siblingAuth } from "@/lib/sibling-auth";

export const getServerSession = cache(async () => {
  const headerList = await headers();
  const session = await siblingAuth.api.getSession({ headers: headerList });
  tagRequestIdentity(session);
  return session;
});
