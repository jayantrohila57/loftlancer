import DashboardSection from "@/components/section-dashboard";
import { SupportTicketCreateAction } from "@/domain/support/components/support-ticket-create-action";
import type { SupportTickets } from "./support.ticket.service";
import { SupportTicketsPage } from "./support.tickets.content";

export function SupportTicketsView({
  initialTickets,
  createRoute = false,
}: {
  initialTickets: SupportTickets;
  createRoute?: boolean;
}) {
  return (
    <DashboardSection
      title="Tickets"
      description="Create and track support requests."
      back={false}
      action={<SupportTicketCreateAction>New ticket</SupportTicketCreateAction>}
    >
      <SupportTicketsPage
        initialTickets={initialTickets}
        createRoute={createRoute}
      />
    </DashboardSection>
  );
}
