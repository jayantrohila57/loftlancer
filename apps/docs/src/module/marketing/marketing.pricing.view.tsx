import { buildSignInUrl } from "@features/authentication/utils/auth-links";
import { appRegistry } from "@features/authorization/config/authorization.apps";
import { MarketingPage } from "@/components/marketing-page";

/** Everything here exists in the product today. */
const included = [
  ...appRegistry.map((app) => `Project app — ${app.name}: ${app.description}`),
  "Organizations, projects, teams and email invitations",
  "Owner, manager and member roles with per-project grants",
  "Encryption at rest for every variable",
  "Activity history and dashboard notifications",
];

const faq = [
  {
    q: "Is there a paid plan?",
    a: "No. Billing isn't built yet, so there is nothing to buy and no card is asked for. If that changes, this page and the docs will change before any charge applies.",
  },
  {
    q: "Are there usage limits?",
    a: "No plan limits are enforced today.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. The source is public on GitHub, and the docs cover deploying it on Vercel with a Neon Postgres database.",
  },
  {
    q: "How do I sign in?",
    a: "With GitHub, Google or a one-time email link. There are no passwords. Your account is created on first sign-in.",
  },
];

export default function PricingPage() {
  return (
    <MarketingPage
      title="Pricing"
      description="One plan, free during early access. No paid tiers exist yet."
    >
      <section className="not-prose bg-card text-card-foreground ring-border/60 flex flex-col gap-3 rounded-xl p-4 ring-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Current offering
          </p>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
            Free during early access
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="flex flex-col gap-0.5">
            <h2 className="mt-0! text-sm font-medium">Early access</h2>
            <p className="text-muted-foreground text-xs">
              Everything Loftlancer does today.
            </p>
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            $0
            <span className="text-muted-foreground text-xs font-normal">
              {" "}
              / month
            </span>
          </p>
        </div>
        <ul className="border-border/60 flex flex-col gap-1.5 border-t pt-3">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="stroke-primary mt-0.5 size-3.5 shrink-0 fill-none stroke-2"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <a
          href={buildSignInUrl()}
          className="bg-primary text-primary-foreground! hover:bg-primary/90 inline-flex h-8 w-full items-center justify-center rounded-lg px-3 text-sm font-medium no-underline! transition-colors"
        >
          Get started free
        </a>
      </section>

      <section className="not-prose mt-12" aria-labelledby="pricing-questions">
        <h2
          id="pricing-questions"
          className="text-xl font-semibold tracking-tight"
        >
          Questions
        </h2>
        <div className="not-prose divide-border/60 ring-border/60 flex flex-col divide-y rounded-xl ring-1">
          {faq.map((item) => (
            <details key={item.q} className="group px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-1.5 text-sm font-medium">
                {item.q}
                <span
                  aria-hidden
                  className="text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-muted-foreground pt-1.5 text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketingPage>
  );
}
