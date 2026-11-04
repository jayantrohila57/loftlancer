import { marketingContainerClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { cn } from "@loftlancer/ui/utils";

const setupSteps = [
  {
    number: "01",
    title: "Create an organization",
    description: "Set up the team workspace and invite the people involved.",
  },
  {
    number: "02",
    title: "Arrange projects and access",
    description:
      "Group work into projects, then assign roles and project access.",
  },
  {
    number: "03",
    title: "Manage the project details",
    description:
      "Use project apps, environments, activity, and notifications as needed.",
  },
] as const;

export function HomeCollaborationSection() {
  return (
    <section className="border-foreground/15 bg-muted/20 border-y">
      <div
        className={cn(
          marketingContainerClass,
          "grid gap-9 py-14 md:grid-cols-[0.82fr_1.18fr] md:gap-16 md:py-20",
        )}
      >
        <div>
          <h2 className="max-w-lg text-3xl font-medium tracking-[-0.05em] text-balance md:text-5xl">
            Invite the people who need project access.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md leading-7">
            Create an organization, invite teammates, and manage access at the
            project level.
          </p>
        </div>
        <ol className="grid gap-x-6 sm:grid-cols-3">
          {setupSteps.map((step) => (
            <li
              key={step.number}
              className="border-foreground/20 border-t pt-4"
            >
              <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                {step.number}
              </span>
              <h3 className="mt-7 text-base font-medium tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
