import DashboardSection from "@/components/section-dashboard";
import ProjectDetailPage from "./projects.overview.content";

export function ProjectOverviewView({ slug }: { slug: string }) {
  return (
    <DashboardSection title="Overview" back={false} hideTabs>
      <ProjectDetailPage slug={slug} />
    </DashboardSection>
  );
}
