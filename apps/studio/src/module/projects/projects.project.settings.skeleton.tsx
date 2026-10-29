import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import DashboardSection from "@/components/section-dashboard";

/** Mirrors the project settings form, status selector, and danger zone. */
export function ProjectSettingsContentSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-4"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <AccordionSectionSkeleton rows={8} />
      <AccordionSectionSkeleton rows={1} />
      <AccordionSectionSkeleton rows={2} />
    </div>
  );
}

/** Route and client fallback with the same geometry as the loaded page. */
export function ProjectSettingsPageSkeleton() {
  return (
    <DashboardSection
      title="Project settings"
      description="Update project information and settings."
      back={false}
      hideTabs
    >
      <ProjectSettingsContentSkeleton />
    </DashboardSection>
  );
}
