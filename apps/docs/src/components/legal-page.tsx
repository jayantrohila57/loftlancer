import { MarketingPage } from "@/components/marketing-page";

const policyLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Security", href: "/legal/security" },
  { label: "Data processing", href: "/legal/dpa" },
  { label: "Acceptable use", href: "/legal/acceptable-use" },
  { label: "Contact", href: "/legal/contact" },
] as const;

export function LegalPolicyNav({ currentHref }: { currentHref: string }) {
  return (
    <nav
      aria-label="Policy pages"
      className="border-foreground/15 border-t pt-4"
    >
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]">
        Trust and policies
      </p>
      <ul className="mt-3 grid gap-1">
        {policyLinks.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={item.href === currentHref ? "page" : undefined}
              className={`block border-l py-1 pl-2 text-sm transition-colors ${
                item.href === currentHref
                  ? "border-foreground font-medium text-foreground"
                  : "border-border/70 text-muted-foreground hover:border-foreground/60 hover:text-foreground"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function LegalPage({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingPage
      eyebrow="Trust / Policy"
      title={title}
      description={
        description ?? "Information about Loftlancer and its hosted service."
      }
      aside={<LegalPolicyNav currentHref={href} />}
    >
      <div className="mb-8 border-amber-600/70 border-l-2 bg-muted/30 px-4 py-3 text-sm leading-6">
        <p className="font-medium">Review in progress</p>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          This page is being reviewed by the project owner. Contact the owner
          before relying on policy details.
        </p>
      </div>
      {children}
    </MarketingPage>
  );
}
