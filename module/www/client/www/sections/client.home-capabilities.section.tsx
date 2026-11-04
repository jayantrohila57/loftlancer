import { marketingContainerClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { cn } from "@loftlancer/ui/utils";

const capabilities = [
  {
    title: "Organizations and projects",
    description:
      "Group people and projects under an organization, then add the project apps your team uses.",
  },
  {
    title: "Access that follows the work",
    description:
      "Manage organization roles, team membership, and project-level access from the workspace.",
  },
  {
    title: "Encrypted environment values",
    description:
      "Keep configuration in project environments. Variable values are encrypted at rest and masked until revealed by an authorized person.",
  },
  {
    title: "A record of change",
    description:
      "Review project activity and use notifications for updates that need your attention.",
  },
] as const;

export function HomeCapabilitiesSection() {
  return (
    <section
      className={cn(
        marketingContainerClass,
        "grid gap-9 py-14 md:grid-cols-[0.82fr_1.18fr] md:gap-16 md:py-20",
      )}
      aria-labelledby="capabilities-heading"
    >
      <div>
        <h2
          id="capabilities-heading"
          className="max-w-lg text-3xl font-medium tracking-[-0.05em] text-balance md:text-5xl"
        >
          Keep project structure and access in view.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-md leading-7">
          Keep the people, permissions, environments, and project tools related
          to your work in the same organization.
        </p>
      </div>
      <ul className="divide-border/70 border-foreground/15 divide-y border-y">
        {capabilities.map((item) => (
          <li
            key={item.title}
            className="grid gap-2 py-4 sm:grid-cols-[0.8fr_1.2fr] sm:gap-4 md:py-5"
          >
            <h3 className="text-sm font-medium md:text-base">{item.title}</h3>
            <p className="text-muted-foreground max-w-lg text-sm leading-6">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
