import DashboardSection from "@/components/section-dashboard";
import { StudioOverviewContent } from "./overview.content";

export function OverviewView() {
  return (
    <DashboardSection
      title="Overview"
      description="Your dashboard overview."
      back={false}
    >
      <StudioOverviewContent />
    </DashboardSection>
  );
}
