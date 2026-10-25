"use client";

import { LayersIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { buttonVariants } from "../components/ui/button";
import { marketingContainerClass } from "../lib/layout-spacing";
import { cn } from "../lib/utils";
import { marketingSiteConfig } from "./site-config";

export type MarketingNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

const primaryNav: MarketingNavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
];

const footerNav = [
  {
    label: "Product",
    items: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Documentation", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
      {
        label: "GitHub",
        href: marketingSiteConfig.links.github,
        external: true,
      },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/legal/contact" },
      { label: "Security", href: "/legal/security" },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/legal/cookies" },
    ],
  },
] satisfies ReadonlyArray<{
  label: string;
  items: readonly MarketingNavItem[];
}>;

type MarketingLinkButtonProps = ComponentProps<"a"> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

function MarketingLinkButton({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: MarketingLinkButtonProps) {
  return (
    <a className={cn(buttonVariants({ className, size, variant }))} {...props}>
      {children}
    </a>
  );
}

function NavLink({
  item,
  pagesBaseUrl,
}: {
  item: MarketingNavItem;
  pagesBaseUrl?: string;
}) {
  const className =
    "inline-flex min-h-8 items-center rounded-sm px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  if (item.external) {
    return (
      <a
        href={item.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.label}
      </a>
    );
  }
  if (pagesBaseUrl) {
    return (
      <a
        href={new URL(
          item.href.replace(/^\//, ""),
          `${pagesBaseUrl.replace(/\/$/, "")}/`,
        ).toString()}
        className={className}
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href as "/"} className={className}>
      {item.label}
    </Link>
  );
}

function MarketingLogo() {
  return (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LayersIcon aria-hidden className="size-4" />
      </span>
      <span className="truncate font-semibold text-sm tracking-tight">
        {marketingSiteConfig.name}
      </span>
    </>
  );
}

export type MarketingSiteHeaderProps = {
  signInHref: string;
  pagesBaseUrl?: string;
  headerActions?: ReactNode;
};

export function MarketingSiteHeader({
  signInHref,
  pagesBaseUrl,
  headerActions,
}: MarketingSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-border/60 border-b bg-background/80 backdrop-blur-md">
      <div
        className={cn(
          marketingContainerClass,
          "flex h-14 items-center justify-between gap-4",
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MarketingLogo />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
          <div className="hidden items-center gap-4 md:flex">
            {primaryNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pagesBaseUrl={pagesBaseUrl}
              />
            ))}
          </div>
          {headerActions}
          <MarketingLinkButton
            size="sm"
            href={signInHref}
            data-testid="marketing-cta-sign-in"
          >
            Sign in
          </MarketingLinkButton>
          <details className="group relative md:hidden">
            <summary className="flex size-8 cursor-pointer list-none items-center justify-center rounded-md border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <MenuIcon aria-hidden className="size-4" />
              <span className="sr-only">Open navigation</span>
            </summary>
            <nav
              className="absolute top-[calc(100%+0.5rem)] right-0 grid w-56 gap-1 rounded-lg border bg-background p-2 shadow-lg"
              aria-label="Mobile navigation"
            >
              {primaryNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pagesBaseUrl={pagesBaseUrl}
                />
              ))}
            </nav>
          </details>
        </nav>
      </div>
    </header>
  );
}

export function MarketingSiteFooter({
  pagesBaseUrl,
}: {
  pagesBaseUrl?: string;
} = {}) {
  return (
    <footer className="border-t">
      <div className={cn(marketingContainerClass, "py-10 md:py-12")}>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MarketingLogo />
            </Link>
            <p className="mt-3 max-w-xs text-muted-foreground text-sm leading-relaxed">
              {marketingSiteConfig.description}
            </p>
          </div>
          {footerNav.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <h2 className="font-medium text-sm">{group.label}</h2>
              <ul className="mt-3 grid gap-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} pagesBaseUrl={pagesBaseUrl} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 border-t pt-6 text-muted-foreground text-sm">
          © {new Date().getFullYear()} {marketingSiteConfig.name}
        </p>
      </div>
    </footer>
  );
}

export type MarketingPageShellProps = {
  signInHref: string;
  pagesBaseUrl?: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

/** Standard marketing chrome for inner pages on `apps/www`. */
export function MarketingPageShell({
  signInHref,
  pagesBaseUrl,
  headerActions,
  children,
}: MarketingPageShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MarketingSiteHeader
        signInHref={signInHref}
        pagesBaseUrl={pagesBaseUrl}
        headerActions={headerActions}
      />
      <main className="flex-1">{children}</main>
      <MarketingSiteFooter pagesBaseUrl={pagesBaseUrl} />
    </div>
  );
}

export { MarketingLinkButton };
