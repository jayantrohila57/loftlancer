import DashboardSection from "@/components/section-dashboard";
import { routes } from "@/utils/navigation";
import { NotificationsPageClient } from "./notifications.list.content";

export function NotificationsListView() {
  return (
    <DashboardSection
      title="Notifications"
      description="Updates about invitations, your organizations, and project activity."
      back={routes.home()}
    >
      <NotificationsPageClient />
    </DashboardSection>
  );
}
