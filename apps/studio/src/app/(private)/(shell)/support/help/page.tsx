import DashboardSection from "@/components/section-dashboard";
import { SupportTicketCreateAction } from "@/domain/support/components/support-ticket-create-action";
import { getSupportArticles } from "@/module/support/support.article.service";
import { SupportHelpSearch } from "@/module/support/support.help.search";

export default async function SupportHelpPage() {
  const articles = await getSupportArticles();
  return (
    <DashboardSection
      title="Help center"
      description="Search frequently asked questions or open a ticket if you need more help."
      back={false}
      action={
        <SupportTicketCreateAction>Open a ticket</SupportTicketCreateAction>
      }
    >
      <SupportHelpSearch initialArticles={articles} />
    </DashboardSection>
  );
}
