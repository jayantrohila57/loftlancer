import type { AuthSession } from "@loftlancer/better-auth/session-types";
import type { NextRequest } from "next/server";
import { enrichSessionUserRole } from "../enrich-session-user";
import { tagRequestIdentity } from "../request-identity";

type SessionAuth = {
  api: {
    getSession: (input: { headers: Headers }) => Promise<AuthSession | null>;
  };
};

export async function createContextWithAuth(
  req: NextRequest,
  auth: SessionAuth,
) {
  const session = await enrichSessionUserRole(
    await auth.api.getSession({
      headers: req.headers,
    }),
  );
  tagRequestIdentity(session);
  const forwarded = req.headers.get("x-forwarded-for");
  return {
    session,
    // Recorded on audit_event so mutations can be traced to a client (#274).
    ipAddress:
      forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null,
    userAgent: req.headers.get("user-agent"),
  };
}

export type Context = {
  session: Awaited<ReturnType<typeof createContextWithAuth>>["session"];
  ipAddress?: string | null;
  userAgent?: string | null;
};
