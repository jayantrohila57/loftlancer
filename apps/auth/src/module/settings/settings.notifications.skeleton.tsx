import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { Skeleton } from "@loftlancer/ui/skeleton";

const SKELETON_ROWS = ["invitation", "membership", "project", "support"];

/** Matches the notification preferences accordion. */
export function NotificationPreferencesSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading notification preferences</span>
      <AccordionSection
        title={<Skeleton aria-hidden="true" className="h-4 w-48" />}
      >
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-3 w-full max-w-lg" />
          <div className="space-y-2">
            {SKELETON_ROWS.map((row) => (
              <div
                key={row}
                className="grid grid-cols-[1fr_4rem_4rem] items-center gap-4 py-2"
              >
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mx-auto h-5 w-9 rounded-full" />
                <Skeleton className="mx-auto h-5 w-9 rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-40" />
        </div>
      </AccordionSection>
    </div>
  );
}
