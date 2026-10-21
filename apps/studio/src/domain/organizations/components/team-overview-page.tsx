"use client";

import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";

export function TeamOverviewPage() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Overview</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Linking a team to a project gives its members default project grants.
          Review each member's grants in project Access.
        </p>
      </div>
      <AccordionSection
        title="How team access works"
        description="Teams connect organization membership to project access."
      >
        <p className="max-w-3xl text-muted-foreground text-sm">
          Add organization members in Members, then link this team to projects
          in Projects. Team members receive the project capabilities granted by
          each link. Project Access shows each person’s effective access and any
          other source that keeps their access active.
        </p>
      </AccordionSection>
    </section>
  );
}
