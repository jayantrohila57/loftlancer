import { appRegistry } from "@loftlancer/actions/apps";
import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Loftlancer is free during early access. No paid plans exist yet.",
  path: "/pricing",
});

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
      <section className="not-prose flex flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground ring-1 ring-border/60">
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="flex flex-col gap-0.5">
            <h2 className="mt-0! font-medium text-sm">Early access</h2>
            <p className="text-muted-foreground text-xs">
              Everything Loftlancer does today.
            </p>
          </div>
          <p className="font-semibold text-2xl tabular-nums">
            $0
            <span className="font-normal text-muted-foreground text-xs">
              {" "}
              / month
            </span>
          </p>
        </div>
        <ul className="flex flex-col gap-1.5 border-border/60 border-t pt-3">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="mt-0.5 size-3.5 shrink-0 fill-none stroke-2 stroke-primary"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <a
          href="/"
          className="no-underline! inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-3 font-medium text-primary-foreground! text-sm transition-colors hover:bg-primary/90"
        >
          Get started free
        </a>
      </section>

      <h2>Questions</h2>
      <div className="not-prose flex flex-col divide-y divide-border/60 rounded-xl ring-1 ring-border/60">
        {faq.map((item) => (
          <details key={item.q} className="group px-3 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-1.5 font-medium text-sm">
              {item.q}
              <span
                aria-hidden
                className="text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pt-1.5 text-muted-foreground text-sm">{item.a}</p>
          </details>
        ))}
      </div>
    </MarketingPage>
  );
}
