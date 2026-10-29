import { guardPageAction } from "@/lib/page-guards";
import { getSupportTickets } from "@/module/support/support.ticket.service";
import { SupportTicketsView } from "@/module/support/support.tickets.view";

export default async function SupportTicketsRoute() {
  const session = await guardPageAction("support.ticket.list");
  const tickets = await getSupportTickets(session);
  return <SupportTicketsView initialTickets={tickets} />;
}
