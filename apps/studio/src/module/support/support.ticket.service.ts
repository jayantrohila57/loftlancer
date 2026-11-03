import "server-only";

import type { AuthSession } from "@loftlancer/better-auth/session-types";
import { studioRouter } from "@loftlancer/orpc/routers/studio";
import { TRPCError } from "@trpc/server";

export async function getSupportTicket(session: AuthSession, ticketId: string) {
  try {
    return await studioRouter
      .createCaller({ session })
      .support.getTicket({ ticketId });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") return null;
    throw error;
  }
}

export type SupportTicketDetail = NonNullable<
  Awaited<ReturnType<typeof getSupportTicket>>
>;

export async function getSupportTickets(session: AuthSession) {
  return studioRouter.createCaller({ session }).support.listTickets({
    limit: 25,
    offset: 0,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
}

export type SupportTickets = Awaited<ReturnType<typeof getSupportTickets>>;
