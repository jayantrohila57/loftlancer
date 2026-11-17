import { HelpSupportTicketDetailPage } from "@modules/help"

type SupportTicketPageProps = {
  readonly params: Promise<{ lang: string; ticketId: string }>
}

export default async function SupportTicketDetailRoute({
  params,
}: SupportTicketPageProps) {
  const { ticketId } = await params
  return <HelpSupportTicketDetailPage ticketId={ticketId} />
}
