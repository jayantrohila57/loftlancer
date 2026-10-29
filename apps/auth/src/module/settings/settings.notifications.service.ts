import "server-only";
import { appRouter } from "@loftlancer/api/routers/index";
import type { AuthSession } from "@loftlancer/auth/session-types";

export async function getNotificationPreferences(session: AuthSession) {
  return appRouter.createCaller({ session }).notifications.preferences();
}
