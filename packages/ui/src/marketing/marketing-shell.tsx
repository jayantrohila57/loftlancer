import { ArrowUpRight, LayersIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "../components/ui/button";
import {
  Menu,
  MenuLinkItem,
  MenuPopup,
  MenuTrigger,
} from "../components/ui/menu";
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
      { label: "Acceptable use", href: "/legal/acceptable-use" },
      { label: "Data processing", href: "/legal/dpa" },
    ],
  },
] satisfies ReadonlyArray<{
  label: string;
  items: readonly MarketingNavItem[];
}>;

function resolvePublicHref(item: MarketingNavItem, pagesBaseUrl?: string) {
  if (item.external || !pagesBaseUrl) return item.href;
  return new URL(
    item.href.replace(/^\//, ""),
    `${pagesBaseUrl.replace(/\/$/, "")}/`,
  ).toString();
}

function NavLink({
  item,
  pagesBaseUrl,
  inverse = false,
}: {
  item: MarketingNavItem;
  pagesBaseUrl?: string;
  inverse?: boolean;
}) {
  const className = cn(
    "group inline-flex min-h-8 items-center gap-1 rounded-sm px-1 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
    inverse
      ? "text-neutral-50/65 hover:text-neutral-50 dark:text-neutral-100/65 dark:hover:text-neutral-100"
      : "text-muted-foreground hover:text-foreground",
    "after:h-px after:w-0 after:bg-current after:transition-[width] hover:after:w-3",
  );
  const href = resolvePublicHref(item, pagesBaseUrl);

  if (item.external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.label}
        <ArrowUpRight aria-hidden className="size-3.5 opacity-60" />
      </a>
    );
  }
  if (pagesBaseUrl) {
    return (
      <a href={href} className={className}>
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

function MarketingLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          inverse
            ? "bg-neutral-50 text-neutral-950 dark:bg-neutral-100 dark:text-neutral-950"
            : "bg-foreground text-background",
        )}
      >
        <LayersIcon aria-hidden className="size-[17px]" strokeWidth={2.2} />
      </span>
      <span
        className={cn(
          "truncate font-semibold text-[15px] tracking-[-0.035em]",
          inverse && "text-neutral-50 dark:text-neutral-100",
        )}
      >
        {marketingSiteConfig.name}
      </span>
    </>
  );
}

export type MarketingSiteHeaderProps = {
  signInHref: string;
  pagesBaseUrl?: string;
  headerActions?: ReactNode;
  mobileMenuActions?: ReactNode;
};

export function MarketingSiteHeader({
  signInHref,
  pagesBaseUrl,
  headerActions,
  mobileMenuActions,
}: MarketingSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-border/70 border-b bg-background/90 backdrop-blur-md">
      <div
        className={cn(
          marketingContainerClass,
          "flex h-[4.25rem] items-center justify-between gap-3 md:h-[4.5rem] md:gap-6",
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${marketingSiteConfig.name} home`}
        >
          <MarketingLogo />
        </Link>
        <div className="flex items-center gap-3 md:gap-6">
          <nav
            className="hidden items-center gap-5 md:flex"
            aria-label="Primary"
          >
            {primaryNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pagesBaseUrl={pagesBaseUrl}
              />
            ))}
          </nav>
          <span aria-hidden className="hidden h-5 w-px bg-border md:block" />
          <div className="flex items-center gap-2">
            {headerActions}
            <Button
              size="sm"
              render={<a href={signInHref} />}
              data-testid="marketing-cta-sign-in"
            >
              Sign in
            </Button>
            <Menu>
              <MenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <MenuIcon aria-hidden className="size-4" />
              </MenuTrigger>
              <MenuPopup align="end" className="w-56">
                <nav aria-label="Mobile navigation" className="grid gap-1">
                  {primaryNav.map((item) => (
                    <MenuLinkItem
                      key={item.href}
                      render={
                        <a href={resolvePublicHref(item, pagesBaseUrl)} />
                      }
                    >
                      {item.label}
                    </MenuLinkItem>
                  ))}
                </nav>
                {mobileMenuActions ? (
                  <div className="mt-1 border-border/70 border-t pt-1">
                    {mobileMenuActions}
                  </div>
                ) : null}
              </MenuPopup>
            </Menu>
          </div>
        </div>
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
    <footer className="bg-neutral-950 text-neutral-50 dark:bg-neutral-900 dark:text-neutral-100">
      <div className={cn(marketingContainerClass, "py-10 md:py-14")}>
        <div className="grid gap-10 border-background/15 border-b pb-10 md:grid-cols-[1.25fr_1fr] md:gap-14 md:pb-14">
          <div className="max-w-lg">
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MarketingLogo inverse />
            </Link>
            <p className="mt-5 max-w-md text-neutral-50/65 text-sm leading-6 dark:text-neutral-100/65">
              {marketingSiteConfig.description}
            </p>
            <p className="mt-5 font-mono text-[10px] text-neutral-50/45 uppercase tracking-[0.12em] dark:text-neutral-100/45">
              Loftlancer · Early access
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 md:gap-x-6">
            {footerNav.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2 className="font-mono text-[10px] text-neutral-50/45 uppercase tracking-[0.12em] dark:text-neutral-100/45">
                  {group.label}
                </h2>
                <ul className="mt-3 grid gap-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        item={item}
                        pagesBaseUrl={pagesBaseUrl}
                        inverse
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 font-mono text-[10px] text-neutral-50/45 uppercase tracking-[0.08em] dark:text-neutral-100/45">
          <p>
            © {new Date().getFullYear()} {marketingSiteConfig.name}
          </p>
          <p>Free to use during early access</p>
        </div>
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

/** Standard marketing chrome for inner public pages. */
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

export const MarketingLayout = MarketingPageShell;
