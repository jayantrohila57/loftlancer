"use client";

import { ArrowRight } from "lucide-react";
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
          "relative flex flex-col items-center py-20 text-center md:py-28",
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
              <Card className="h-full transition-colors hover:bg-muted/30">
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
              Bring your organization, projects, teams, and apps into one clear
              workspace. Your environment variables stay encrypted.
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
        <CtaSection signInHref={signInHref} />
      </main>
      <MarketingSiteFooter pagesBaseUrl={pagesBaseUrl} />
    </div>
  );
}
