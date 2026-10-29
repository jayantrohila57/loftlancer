import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { TeamOverviewContent } from "./teams.overview.content";

export function TeamOverviewView({ teamId }: { teamId: string }) {
  return (
    <TeamOverviewContent teamId={teamId}>
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
    </TeamOverviewContent>
  );
}
