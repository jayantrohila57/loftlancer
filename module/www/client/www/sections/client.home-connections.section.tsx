import { SectionHeading } from "@features/marketing/core/client";
import { marketingContainerClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { cn } from "@loftlancer/ui/utils";

export function HomeConnectionsSection() {
  return (
    <section
      className={cn(
        marketingContainerClass,
        "grid gap-8 py-14 md:grid-cols-[0.82fr_1.18fr] md:gap-16 md:py-20",
      )}
    >
      <SectionHeading
        title="Sign in with GitHub, Google, or email."
        description="All three sign-in methods are available today. Compatible product integrations are planned."
      />
      <div className="border-foreground/15 border-y">
        <div className="border-border/70 flex items-center gap-3 border-b py-4">
          <span
            aria-hidden
            className="bg-foreground size-1.5 shrink-0 rounded-full"
          />
          <p className="text-sm font-medium">GitHub and Google sign-in</p>
          <span className="text-muted-foreground ml-auto text-sm">
            Available
          </span>
        </div>
        <div className="border-border/70 flex items-center gap-3 border-b py-4">
          <span
            aria-hidden
            className="bg-foreground size-1.5 shrink-0 rounded-full"
          />
          <p className="text-sm font-medium">One-time email link</p>
          <span className="text-muted-foreground ml-auto text-sm">
            Available
          </span>
        </div>
        <div className="flex items-center gap-3 py-4">
          <span
            aria-hidden
            className="bg-muted-foreground/50 size-1.5 shrink-0 rounded-full"
          />
          <p className="text-sm font-medium">Compatible product integrations</p>
          <span className="text-muted-foreground ml-auto text-sm">Planned</span>
        </div>
      </div>
    </section>
  );
}
