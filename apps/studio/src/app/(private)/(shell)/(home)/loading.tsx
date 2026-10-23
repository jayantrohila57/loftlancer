import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import DashboardSection from "@/components/section-dashboard";

export default function OrganizationsLoading() {
  return (
    <DelayedPageLoading
      fallback={
        <DashboardSection
          title="Overview"
          description="Your dashboard overview."
          back={false}
          hideTabs
        >
          <AccordionSectionSkeleton rows={2} />
        </DashboardSection>
      }
    />
  );
}
