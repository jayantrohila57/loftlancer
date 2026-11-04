import { marketingContainerClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { cn } from "@loftlancer/ui/utils";

const capabilities = [
  {
    title: "Organizations and projects",
    description:
      "Keep teams, projects, and the apps installed for each project in a clear hierarchy.",
  },
  {
    title: "Access that follows the work",
    description:
      "Use organization roles, teams, and per-project grants to give people the access their work needs.",
  },
  {
    title: "Encrypted environment values",
    description:
      "Separate values by environment. Values are encrypted at rest and masked in the interface.",
  },
  {
    title: "A record of change",
    description:
      "Review activity and notifications across the organizations and projects you manage.",
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
          Organize people and projects in one hierarchy, with access and
          configuration alongside.
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
