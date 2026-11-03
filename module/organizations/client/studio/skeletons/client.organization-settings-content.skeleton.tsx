"use client";

import { AccordionSectionSkeleton } from "@features/patterns/core/client/patterns.accordion-section-skeleton";

export function OrganizationSettingsContentSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-4"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <AccordionSectionSkeleton rows={2} />
      <AccordionSectionSkeleton rows={1} />
      <AccordionSectionSkeleton rows={3} />
      <AccordionSectionSkeleton rows={3} />
      <AccordionSectionSkeleton rows={4} />
      <AccordionSectionSkeleton rows={2} />
      <AccordionSectionSkeleton rows={2} />
    </div>
  );
}
