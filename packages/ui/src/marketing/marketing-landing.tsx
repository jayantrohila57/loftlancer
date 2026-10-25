"use client";

import { ArrowRight, CheckIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "../components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "../components/ui/card";
import { marketingContainerClass } from "../lib/layout-spacing";
import { cn } from "../lib/utils";
import { marketingFeatures } from "./features";
import {
  MarketingLinkButton,
  MarketingSiteFooter,
  MarketingSiteHeader,
} from "./marketing-shell";
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

function HeroSection({ signInHref }: { signInHref: string }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,--alpha(var(--color-neutral-400)/16%),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,--alpha(var(--color-neutral-500)/22%),transparent)]"
        aria-hidden
      />
      <div
        className={cn(
          marketingContainerClass,
          "relative flex flex-col items-center pt-20 pb-14 text-center md:pt-28 md:pb-16",
        )}
      >
        <Badge variant="outline" className="mb-6">
          Workspace management, made clear
        </Badge>
        <h1
          className="max-w-3xl font-semibold text-4xl tracking-tight md:text-6xl md:leading-[1.08]"
          data-testid="marketing-hero-title"
        >
          {marketingSiteConfig.tagline}
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
          {marketingSiteConfig.description}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MarketingLinkButton
            size="lg"
            href={signInHref}
            data-testid="marketing-cta-get-started"
          >
            Get started
            <ArrowRight className="size-4 opacity-80" />
          </MarketingLinkButton>
          <MarketingLinkButton
            size="lg"
            variant="outline"
            href={marketingSiteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </MarketingLinkButton>
        </div>
      </div>
      <div className={cn(marketingContainerClass, "relative pb-16 md:pb-24")}>
        <figure className="overflow-hidden rounded-xl border bg-muted/30 shadow-sm">
          <Image
            alt="Loftlancer Studio organization overview showing navigation, projects, and workspace settings."
            className="h-auto w-full"
            height={1108}
            priority
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1200px) calc(100vw - 3rem), 1152px"
            src="/studio-overview.jpg"
            width={2010}
          />
        </figure>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className={cn(marketingContainerClass, "scroll-mt-16 py-16 md:py-24")}
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="features-heading"
          className="font-semibold text-2xl tracking-tight md:text-3xl"
        >
          A connected workspace for your team
        </h2>
        <p className="mt-3 text-muted-foreground">
          Manage the people and resources around your work, with clear access
          and encrypted configuration in one place.
        </p>
      </div>
      <ul
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 [&>li:last-child:nth-child(5)]:lg:col-start-4 [&>li:nth-last-child(2)]:lg:col-start-2"
        data-testid="marketing-features"
      >
        {marketingFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="lg:col-span-2">
              <Card className="h-full transition-colors hover:bg-muted/30 motion-reduce:transition-none">
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const workflowSteps = [
  {
    label: "01",
    title: "Create an organization",
    description:
      "Set up the workspace where members, roles, and shared administration belong.",
  },
  {
    label: "02",
    title: "Add a project",
    description:
      "Group the apps, people, and access rules that support a piece of work.",
  },
  {
    label: "03",
    title: "Use project apps",
    description:
      "Install the available project apps, including environments and tasks, when your project needs them.",
  },
] as const;

function WorkflowSection() {
  return (
    <section
      className="border-y bg-muted/20"
      aria-labelledby="workflow-heading"
    >
      <div className={cn(marketingContainerClass, "py-16 md:py-24")}>
        <div className="max-w-2xl">
          <p className="font-medium text-muted-foreground text-sm">Workflow</p>
          <h2
            id="workflow-heading"
            className="mt-2 font-semibold text-2xl tracking-tight md:text-3xl"
          >
            A clear path from workspace to project work
          </h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((step) => (
            <li
              key={step.label}
              className="rounded-xl border bg-background p-5"
            >
              <span className="font-medium text-muted-foreground text-sm tabular-nums">
                {step.label}
              </span>
              <h3 className="mt-6 font-medium text-base">{step.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  return (
    <section className={cn(marketingContainerClass, "py-16 md:py-24")}>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-medium text-muted-foreground text-sm">
            Connections
          </p>
          <h2 className="mt-2 font-semibold text-2xl tracking-tight md:text-3xl">
            Keep access connected to your workspace
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
            Sign in with GitHub, Google, or an email link. More compatible tool
            connections are planned and will use the same workspace access
            controls.
          </p>
        </div>
        <ul
          className="grid gap-3"
          aria-label="Available and planned connections"
        >
          <li className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckIcon aria-hidden className="size-4" />
            </span>
            <div>
              <p className="font-medium text-sm">GitHub sign-in</p>
              <p className="text-muted-foreground text-sm">Available today</p>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <span className="flex size-8 items-center justify-center rounded-full border text-muted-foreground">
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
            </span>
            <div>
              <p className="font-medium text-sm">Compatible tool connections</p>
              <p className="text-muted-foreground text-sm">Planned</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

const faq = [
  {
    question: "Where do I start?",
    answer:
      "Sign in, then create or join an organization. From there, you can create projects and add members.",
  },
  {
    question: "How does access work?",
    answer:
      "Organization roles set workspace access. Project grants and teams can add access for the projects where people need to work.",
  },
  {
    question: "How are environment variables protected?",
    answer:
      "Variables are encrypted at rest and masked in the interface until an authorized person chooses to reveal them.",
  },
  {
    question: "Can I connect other tools?",
    answer:
      "More compatible tool connections are planned. They are not available as product integrations today.",
  },
] as const;

function FaqSection() {
  return (
    <section className="border-t bg-muted/20" aria-labelledby="faq-heading">
      <div className={cn(marketingContainerClass, "py-16 md:py-24")}>
        <div className="mx-auto max-w-2xl">
          <h2
            id="faq-heading"
            className="font-semibold text-2xl tracking-tight md:text-3xl"
          >
            Questions, answered clearly
          </h2>
          <div className="mt-8 divide-y rounded-xl border bg-background">
            {faq.map((item) => (
              <details key={item.question} className="group px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden
                    className="text-muted-foreground transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="pt-3 text-muted-foreground text-sm leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection({ signInHref }: { signInHref: string }) {
  return (
    <section className="border-t bg-muted/30">
      <div
        className={cn(
          marketingContainerClass,
          "flex flex-col items-center py-16 text-center md:py-20",
        )}
      >
        <Card className="w-full max-w-2xl border-border/80 shadow-sm">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-xl md:text-2xl">
              Make your workspace easier to manage
            </CardTitle>
            <CardDescription className="max-w-md text-base">
              Bring your organization, projects, teams, and project apps into
              one clear workspace. Your environment variables stay encrypted.
            </CardDescription>
          </CardHeader>
          <CardPanel className="flex justify-center pb-8">
            <MarketingLinkButton
              size="lg"
              href={signInHref}
              data-testid="marketing-cta-bottom"
            >
              Continue with GitHub
            </MarketingLinkButton>
          </CardPanel>
        </Card>
      </div>
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
        <div className={cn(marketingContainerClass, "py-4")}>
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border bg-muted/30 px-4 py-3 text-sm"
          >
            <p className="font-medium">Your account was deleted.</p>
            <p className="mt-1 text-muted-foreground">
              Your profile was anonymized and your sessions were revoked.
              Organization, project, and audit records remain, with no automatic
              removal date currently set. You cannot restore this profile
              yourself; sign in with a different account to continue.
            </p>
          </div>
        </div>
      ) : null}
      <main className="flex-1">
        <HeroSection signInHref={signInHref} />
        <FeaturesSection />
        <WorkflowSection />
        <IntegrationsSection />
        <FaqSection />
        <CtaSection signInHref={signInHref} />
      </main>
      <MarketingSiteFooter pagesBaseUrl={pagesBaseUrl} />
    </div>
  );
}
