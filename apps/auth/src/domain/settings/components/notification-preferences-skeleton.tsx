import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { Skeleton } from "@loftlancer/ui/skeleton";

/** Matches the notification preferences accordion. */
export function NotificationPreferencesSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading notification preferences</span>
      <AccordionSection
        title={<Skeleton aria-hidden="true" className="h-4 w-48" />}
      >
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-3 w-full max-w-md" />
          <Skeleton className="h-9 w-44" />
        </div>
      </AccordionSection>
    </div>
  );
}
