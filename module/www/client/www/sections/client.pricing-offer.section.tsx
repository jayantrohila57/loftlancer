import { appRegistry } from "@features/authorization/config/authorization.apps";
import { Button } from "@loftlancer/ui/button";

const included = [
  {
    area: "Workspace",
    description: "Organizations, projects, teams, and member invitations.",
  },
  {
    area: "Access",
    description: "Organization roles, team membership, and project grants.",
  },
  {
    area: "Configuration",
    description: "Project environments and encrypted-at-rest variables.",
  },
  {
    area: "Activity",
    description: "Project activity history and dashboard notifications.",
  },
];

export function PricingOfferSection() {
  return (
    <section aria-labelledby="early-access-title" className="scroll-mt-28">
      <div className="border-foreground/15 grid gap-8 border-y py-7 md:grid-cols-[1fr_auto] md:items-center md:py-9">
        <div>
          <h2
            id="early-access-title"
            className="mt-0! border-0! pb-0! text-3xl! tracking-[-0.05em]! md:text-4xl!"
          >
            Early access
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            Use the current Loftlancer product while it remains in early access.
            No payment details are required, and billing is not available.
          </p>
        </div>
        <div className="border-border/70 flex flex-wrap items-end gap-x-4 gap-y-3 border-t pt-5 md:min-w-64 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <div>
            <p className="text-6xl font-medium tracking-[-0.08em]">$0</p>
            <p className="text-muted-foreground mt-1 text-sm">
              During early access
            </p>
          </div>
          <Button className="ml-auto" render={<a href="/sign-in" />}>
            Get started
          </Button>
        </div>
      </div>
      <div className="border-foreground/15 grid gap-6 border-b py-7 md:grid-cols-[0.58fr_1.42fr] md:gap-12 md:py-9">
        <div>
          <h3 className="mt-0 text-xl font-medium tracking-[-0.04em]">
            What comes with early access
          </h3>
        </div>
        <ul className="divide-border/70 border-border/70 divide-y border-y">
          {included.map((item, index) => (
            <li
              key={item.area}
              className="grid gap-1.5 py-3 sm:grid-cols-[2rem_0.45fr_1.55fr] sm:gap-4"
            >
              <span className="text-muted-foreground font-mono text-[10px] tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium">{item.area}</span>
              <span className="text-muted-foreground text-sm leading-6">
                {item.description}
                {item.area === "Workspace" ? (
                  <span className="block pt-1">
                    Project apps include{" "}
                    {appRegistry.map((app) => app.name).join(", ")}.
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
