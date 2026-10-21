"use client";

import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { InstalledAppsOverview } from "@/domain/apps/components/installed-apps-overview";

export function ProjectOverviewSectionsSkeleton() {
  return <AccordionSectionSkeleton rows={1} />;
}

export function ProjectOverviewSections({ slug }: { slug: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <AccordionSection
        title="Installed apps"
        description="Applications connected to this project."
      >
        <InstalledAppsOverview slug={slug} />
      </AccordionSection>
    </div>
  );
}
