import { ProjectAccessPage } from "./projects.access.content";
import { ProjectSection } from "./projects.section";

export function ProjectAccessView({ slug }: { slug: string }) {
  return (
    <ProjectSection
      title="Access"
      description="Manage project managers, teams with access, and individual access."
    >
      <ProjectAccessPage slug={slug} />
    </ProjectSection>
  );
}
