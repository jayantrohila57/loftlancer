import DashboardSection from "@/components/section-dashboard";
import { ProjectAppsDirectory } from "./apps.project.apps.directory";

export function AppsDirectoryView({ slug }: { slug: string }) {
  return (
    <DashboardSection
      title="Apps"
      description="Install apps to add features to this project. Apps are per project."
      back={false}
      hideTabs
    >
      <ProjectAppsDirectory slug={slug} />
    </DashboardSection>
  );
}
