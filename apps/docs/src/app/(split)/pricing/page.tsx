import { appRegistry } from "@loftlancer/actions/apps";
import { Button } from "@loftlancer/ui/button";
import { FAQSection } from "@loftlancer/ui/marketing";
import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Loftlancer is free during early access. No paid plans exist yet.",
  path: "/pricing",
});

const faq = [
  {
    q: "Is there a paid plan?",
    a: "No. Billing is not available, so there is nothing to buy and no card is requested. If plans change, this page and the docs will be updated before any charge applies.",
  },
  {
    q: "Are there usage limits?",
    a: "No plan limits are enforced today.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. The source is public on GitHub, and the documentation covers deploying it with Vercel and Neon Postgres.",
  },
  {
    q: "How do I sign in?",
    a: "Use GitHub, Google, or a one-time email link. Your account is created when you sign in for the first time.",
  },
];

const included = [
  {
    area: "Workspace",
    description: "Organizations, projects, teams, and email invitations.",
  },
  {
    area: "Access",
    description: "Owner, manager, and member roles with per-project grants.",
  },
  {
    area: "Configuration",
    description: "Encrypted-at-rest variables with separate environments.",
  },
  {
    area: "Activity",
    description: "Activity history and dashboard notifications.",
  },
];

export default function PricingPage() {
  return (
    <MarketingPage
      eyebrow="Product / Pricing"
      title="Free during early access."
      description="Every current feature is available at no cost. Billing and paid plans are not available today."
    >
      <section aria-labelledby="early-access-title" className="scroll-mt-28">
        <div className="grid gap-8 border-foreground/15 border-y py-7 md:grid-cols-[1fr_auto] md:items-center md:py-9">
          <div>
            <p className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              Current offer
            </p>
            <h2
              id="early-access-title"
              className="mt-0! border-0! pb-0! text-3xl! tracking-[-0.05em]! md:text-4xl!"
            >
              Early access
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground leading-7">
              Full access to Loftlancer&apos;s current product while it remains
              in early access. No payment details required.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3 border-border/70 border-t pt-5 md:min-w-64 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <div>
              <p className="font-medium text-6xl tracking-[-0.08em]">$0</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                during early access
              </p>
            </div>
            <Button className="ml-auto" render={<a href="/sign-in" />}>
              Get started
            </Button>
          </div>
        </div>
        <div className="grid gap-6 border-foreground/15 border-b py-7 md:grid-cols-[0.58fr_1.42fr] md:gap-12 md:py-9">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
              Included today
            </p>
            <h3 className="mt-3 font-medium text-xl tracking-[-0.04em]">
              What comes with early access
            </h3>
          </div>
          <ul className="divide-y divide-border/70 border-border/70 border-y">
            {included.map((item, index) => (
              <li
                key={item.area}
                className="grid gap-1.5 py-3 sm:grid-cols-[2rem_0.45fr_1.55fr] sm:gap-4"
              >
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-medium text-sm">{item.area}</span>
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

      <div className="mt-2">
        <FAQSection
          title="Pricing questions"
          description="Clear answers about the current offer and what exists in the product today."
          items={faq.map((item) => ({ question: item.q, answer: item.a }))}
        />
      </div>
    </MarketingPage>
  );
}
