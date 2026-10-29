import { notFound } from "next/navigation";
import DashboardSection from "@/components/section-dashboard";
import { guardSupportTicketPage } from "@/lib/page-guards";
import { SupportTicketContent } from "@/module/support/support.ticket.content";
import { getSupportTicket } from "@/module/support/support.ticket.service";

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const session = await guardSupportTicketPage(ticketId);
  const detail = await getSupportTicket(session, ticketId);
  if (!detail) notFound();
  return (
    <DashboardSection
      title={`#${detail.ticket.ticketNumber} ${detail.ticket.subject}`}
      back={false}
    >
      <SupportTicketContent initialDetail={detail} />
    </DashboardSection>
  );
}
