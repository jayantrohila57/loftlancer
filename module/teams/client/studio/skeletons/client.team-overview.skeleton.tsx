import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
export function TeamOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <AccordionSectionSkeleton rows={2} />
      <AccordionSectionSkeleton rows={1} />
    </div>
  );
}
