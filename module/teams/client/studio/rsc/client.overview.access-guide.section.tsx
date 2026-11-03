import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import dynamic from "next/dynamic";

const AccordionSection = dynamic(
  () =>
    import("@loftlancer/ui/patterns/accordion-section").then(
      (m) => m.AccordionSection,
    ),
  { loading: () => <AccordionSectionSkeleton rows={1} /> },
);

/** Static copy — server-rendered shell with a client accordion leaf. */
export function TeamOverviewAccessGuideSection() {
  return (
    <AccordionSection
      title="How team access works"
      description="Teams connect organization membership to project access."
    >
      <p className="max-w-3xl text-muted-foreground text-sm">
        Add organization members in Members, then choose which projects this
        team can access in Projects. Project Access shows what each person can
        do.
      </p>
    </AccordionSection>
  );
}
