import "server-only";
import { listActiveUserSessions } from "@loftlancer/auth/session-list";

export async function getActiveSessions(userId: string) {
  const sessions = await listActiveUserSessions(userId);
  return sessions.map((session) => ({
    ...session,
    createdAt: session.createdAt?.toISOString(),
    updatedAt: session.updatedAt?.toISOString(),
  }));
}
