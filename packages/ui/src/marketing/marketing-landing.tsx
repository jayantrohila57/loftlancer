import { ArrowRight, CheckIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { Button } from "../components/ui/button";
import { marketingContainerClass } from "../lib/layout-spacing";
import { cn } from "../lib/utils";
import {
  CallToAction,
  FAQSection,
  FeatureShowcase,
  PageContainer,
  ProductPreview,
  SectionHeading,
} from "./marketing-components";
import { MarketingSiteFooter, MarketingSiteHeader } from "./marketing-shell";
import { marketingSiteConfig } from "./site-config";

export type MarketingLandingProps = {
  signInHref: string;
  /** Show one-time confirmation after account deletion. */
  accountDeleted?: boolean;
  /** Absolute base URL for pages hosted by the docs app. */
  pagesBaseUrl?: string;
  /** Optional slot for theme toggle (rendered in header). */
  headerActions?: ReactNode;
};

function HeroSection({
  signInHref,
  pagesBaseUrl,
}: {
  signInHref: string;
  pagesBaseUrl?: string;
}) {
  const [headlineLead = marketingSiteConfig.tagline, headlineTail] =
    marketingSiteConfig.tagline.split(", and ");
  const featuresHref = pagesBaseUrl
    ? new URL("features", `${pagesBaseUrl.replace(/\/$/, "")}/`).toString()
    : "/features";
  return (
    <section className="border-foreground/15 border-b">
      <div
        className={cn(marketingContainerClass, "pt-9 pb-8 md:pt-14 md:pb-10")}
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-border/70 border-b pb-3 md:mb-9">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
            Workspace · Access · Environments
          </p>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
            Early access
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-[minmax(0,1.25fr)_minmax(15rem,0.75fr)] md:items-end md:gap-12">
          <h1
            className="max-w-4xl text-balance font-medium text-[clamp(3.25rem,5.2vw,5.4rem)] leading-[0.92] tracking-[-0.065em]"
            data-testid="marketing-hero-title"
          >
            <span className="block">{headlineLead},</span>
            {headlineTail ? (
              <>
                {" "}
                <span className="block">and {headlineTail}</span>
              </>
            ) : null}
          </h1>
          <div className="max-w-md pb-1 md:justify-self-end">
            <p className="text-pretty text-base text-muted-foreground leading-7 md:text-lg">
              {marketingSiteConfig.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Button
                size="lg"
                render={<a href={signInHref} />}
                data-testid="marketing-cta-get-started"
              >
                Open your workspace
                <ArrowRight aria-hidden className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<a href={featuresHref} />}
              >
                Explore features
              </Button>
            </div>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
              Free during early access · No paid plans yet
            </p>
          </div>
        </div>
      </div>
      <div className={cn(marketingContainerClass, "pb-8 md:pb-10")}>
        <ProductPreview
          label="Loftlancer Studio / Organization overview"
          note="A view from the product"
        >
          <Image
            alt="Loftlancer Studio showing an organization workspace and project navigation."
            className="h-auto w-full"
            height={1108}
            priority
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1200px) calc(100vw - 3rem), 1152px"
            src="/studio-overview.jpg"
            width={2010}
          />
        </ProductPreview>
      </div>
    </section>
  );
}

const capabilities = [
  {
    number: "01",
    title: "Organizations and projects",
    description:
      "Keep teams, projects, and the apps installed for each project in a clear hierarchy.",
  },
  {
    number: "02",
    title: "Access that follows the work",
    description:
      "Use organization roles, teams, and per-project grants to give people the access their work needs.",
  },
  {
    number: "03",
    title: "Encrypted environment values",
    description:
      "Separate values by environment. Values are encrypted at rest and masked in the interface.",
  },
  {
    number: "04",
    title: "A record of change",
    description:
      "Review activity and notifications across the organizations and projects you manage.",
  },
] as const;

function CapabilitySection() {
  return (
    <section
      className={cn(
        marketingContainerClass,
        "grid gap-9 py-14 md:grid-cols-[0.82fr_1.18fr] md:gap-16 md:py-20",
      )}
      aria-labelledby="capabilities-heading"
    >
      <div>
        <p className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
          One connected workspace
        </p>
        <h2
          id="capabilities-heading"
          className="max-w-lg text-balance font-medium text-3xl tracking-[-0.05em] md:text-5xl"
        >
          Keep project structure and access in view.
        </h2>
        <p className="mt-4 max-w-md text-muted-foreground leading-7">
          Organize people and projects in one hierarchy, with access and
          configuration alongside.
        </p>
      </div>
      <ol className="divide-y divide-border/70 border-foreground/15 border-y">
        {capabilities.map((item) => (
          <li
            key={item.number}
            className="grid gap-2 py-4 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-4 md:py-5"
          >
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {item.number}
            </span>
            <h3 className="font-medium text-sm md:text-base">{item.title}</h3>
            <p className="max-w-lg text-muted-foreground text-sm leading-6">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

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

function CollaborationSection() {
  return (
    <section className="border-foreground/15 border-y bg-muted/20">
      <div
        className={cn(
          marketingContainerClass,
          "grid gap-9 py-14 md:grid-cols-[0.82fr_1.18fr] md:gap-16 md:py-20",
        )}
      >
        <div>
          <p className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
            Shared work
          </p>
          <h2 className="max-w-lg text-balance font-medium text-3xl tracking-[-0.05em] md:text-5xl">
            Invite the people who need project access.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground leading-7">
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
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {step.number}
              </span>
              <h3 className="mt-7 font-medium text-base tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm leading-6">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ConnectionsSection() {
  return (
    <section
      className={cn(
        marketingContainerClass,
        "grid gap-8 py-14 md:grid-cols-[0.82fr_1.18fr] md:gap-16 md:py-20",
      )}
    >
      <SectionHeading
        eyebrow="Sign-in and connections"
        title="Sign in with GitHub, Google, or email."
        description="All three sign-in methods are available today. Compatible product integrations are planned."
      />
      <div className="border-foreground/15 border-y">
        <div className="flex items-center gap-3 border-border/70 border-b py-4">
          <CheckIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
          <p className="font-medium text-sm">GitHub and Google sign-in</p>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
            Available
          </span>
        </div>
        <div className="flex items-center gap-3 border-border/70 border-b py-4">
          <CheckIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
          <p className="font-medium text-sm">One-time email link</p>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
            Available
          </span>
        </div>
        <div className="flex items-center gap-3 py-4">
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
          />
          <p className="font-medium text-sm">Compatible product integrations</p>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
            Planned
          </span>
        </div>
      </div>
    </section>
  );
}

const faq = [
  {
    question: "Where do I start?",
    answer:
      "Sign in, then create or join an organization. From there, you can create projects and invite members.",
  },
  {
    question: "How does project access work?",
    answer:
      "Organization roles set workspace access. Teams and project grants can extend access for the projects where people need to work.",
  },
  {
    question: "How are environment variables protected?",
    answer:
      "Values are encrypted at rest and masked in the interface. People with the right access can reveal them when needed.",
  },
  {
    question: "Can I connect other tools?",
    answer:
      "Additional compatible tool integrations are planned. They are not available as product integrations today.",
  },
] as const;

function HomePricingSection({ pagesBaseUrl }: { pagesBaseUrl?: string }) {
  const pricingHref = pagesBaseUrl
    ? new URL("pricing", `${pagesBaseUrl.replace(/\/$/, "")}/`).toString()
    : "/pricing";
  return (
    <section className="border-foreground/15 border-y">
      <PageContainer className="grid gap-6 py-9 md:grid-cols-[1fr_auto] md:items-center md:py-11">
        <div>
          <p className="mb-3 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
            Early access
          </p>
          <h2 className="font-medium text-2xl tracking-[-0.04em] md:text-3xl">
            The product is free to use today.
          </h2>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            Billing and paid plans are not available. See what is included in
            early access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-border/70 border-t pt-4 md:min-w-64 md:border-t-0 md:border-l md:pt-0 md:pl-7">
          <span className="font-medium text-4xl tracking-[-0.06em]">$0</span>
          <span className="max-w-24 text-muted-foreground text-xs leading-5">
            during early access
          </span>
          <a
            href={pricingHref}
            className="ml-auto text-sm underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Pricing details
          </a>
        </div>
      </PageContainer>
    </section>
  );
}

export function MarketingLanding({
  signInHref,
  accountDeleted = false,
  pagesBaseUrl,
  headerActions,
}: MarketingLandingProps) {
  return (
    <div
      data-testid="marketing-landing"
      className="flex min-h-svh flex-col bg-background"
    >
      <MarketingSiteHeader
        signInHref={signInHref}
        pagesBaseUrl={pagesBaseUrl}
        headerActions={headerActions}
      />
      {accountDeleted ? (
        <div className={cn(marketingContainerClass, "pt-4")}>
          <div
            role="status"
            aria-live="polite"
            className="border-foreground/60 border-l-2 bg-muted/30 px-4 py-3 text-sm"
          >
            <p className="font-medium">Your account was deleted.</p>
            <p className="mt-1 max-w-4xl text-muted-foreground leading-6">
              Your profile was anonymized and your sessions were revoked.
              Organization, project, and audit records remain, with no automatic
              removal date currently set. You cannot restore this profile
              yourself; sign in with a different account to continue.
            </p>
          </div>
        </div>
      ) : null}
      <main className="flex-1">
        <HeroSection signInHref={signInHref} pagesBaseUrl={pagesBaseUrl} />
        <CapabilitySection />
        <PageContainer>
          <FeatureShowcase
            label="01 / Organization structure"
            title="Projects stay connected to their organization."
            description="Group projects, project apps, environments, and access inside the organization that owns them. Teams can see where each resource lives and who can manage it."
            visual={
              <ProductPreview
                label="Loftlancer Studio / Projects"
                note="Organization and project view"
              >
                <Image
                  alt="Loftlancer Studio projects page with organization navigation and project list."
                  className="h-auto w-full"
                  height={1108}
                  sizes="(max-width: 767px) calc(100vw - 2rem), 680px"
                  src="/studio-projects.jpg"
                  width={2010}
                />
              </ProductPreview>
            }
          />
          <FeatureShowcase
            reverse
            label="02 / Access and configuration"
            title="Permissions and environment values, with useful context."
            description="Organization roles, team membership, and project grants shape who can work on each project. Environment values are encrypted at rest and masked in the interface."
            visual={
              <ProductPreview
                label="Loftlancer Studio / Access"
                note="Role and project permissions"
              >
                <Image
                  alt="Loftlancer Studio access settings showing organization roles and project permissions."
                  className="h-auto w-full"
                  height={1108}
                  sizes="(max-width: 767px) calc(100vw - 2rem), 680px"
                  src="/studio-access.jpg"
                  width={2010}
                />
              </ProductPreview>
            }
          />
        </PageContainer>
        <CollaborationSection />
        <ConnectionsSection />
        <HomePricingSection pagesBaseUrl={pagesBaseUrl} />
        <PageContainer>
          <FAQSection items={faq} />
        </PageContainer>
        <CallToAction
          title="Bring your projects and team into one workspace."
          description="Create an organization, invite your team, and keep project access and configuration together."
          href={signInHref}
          actionLabel="Open your workspace"
        />
      </main>
      <MarketingSiteFooter pagesBaseUrl={pagesBaseUrl} />
    </div>
  );
}
