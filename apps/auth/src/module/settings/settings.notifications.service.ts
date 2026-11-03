import "server-only";
import type { AuthSession } from "@loftlancer/better-auth/session-types";
import { appRouter } from "@loftlancer/orpc/routers/index";

export async function getNotificationPreferences(session: AuthSession) {
  return appRouter.createCaller({ session }).notifications.preferences();
}
