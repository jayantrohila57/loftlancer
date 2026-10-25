import { listActiveUserSessions } from "@loftlancer/auth/session-list";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * Lists the signed-in user's active sessions without Better Auth's freshness
 * requirement. Viewing active sessions must remain available after the initial
 * sign-in window; destructive session operations still use Better Auth's
 * authoritative-session endpoints.
 */
export async function GET() {
  const current = await getServerSession();
  if (!current?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await listActiveUserSessions(current.user.id);
  return NextResponse.json(sessions, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
