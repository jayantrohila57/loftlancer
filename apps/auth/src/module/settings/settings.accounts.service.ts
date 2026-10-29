import "server-only";
import { appRouter } from "@loftlancer/api/routers/index";
import type { AuthSession } from "@loftlancer/auth/session-types";

export async function getConnectedAccounts(session: AuthSession) {
  return appRouter.createCaller({ session }).account.listConnectedAccounts();
}
