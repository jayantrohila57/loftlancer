import { Button } from "@loftlancer/ui/button";
import {
  Menu,
  MenuLinkItem,
  MenuPopup,
  MenuTrigger,
} from "@loftlancer/ui/menu";
import type { ReactNode } from "react";

export type SharedHeaderLink = {
  href: string;
  label: string;
};

/** Reusable responsive application header; product-specific links stay with callers. */
export function SharedHeader({
  brand,
  brandHref = "/",
  brandLabel,
  links,
  actions,
  className,
}: {
  brand: ReactNode;
  brandHref?: string;
  brandLabel: string;
  links: readonly SharedHeaderLink[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`bg-background/95 border-border/70 sticky top-0 z-50 border-b ${className ?? ""}`}
    >
      <div className="mx-auto flex h-[4.25rem] w-full max-w-[76rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href={brandHref}
          aria-label={brandLabel}
          className="focus-visible:ring-ring flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2"
        >
          {brand}
        </a>
        <div className="flex items-center gap-3 md:gap-6">
          <nav
            className="hidden items-center gap-5 md:flex"
            aria-label="Primary"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center rounded-sm text-sm transition-colors outline-none focus-visible:ring-2"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {actions ? (
            <div className="flex items-center gap-2">
              {actions}
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 md:hidden"
                      aria-label="Open navigation menu"
                    />
                  }
                >
                  Menu
                </MenuTrigger>
                <MenuPopup align="end" className="w-56">
                  <nav aria-label="Mobile navigation" className="grid gap-1">
                    {links.map((link) => (
                      <MenuLinkItem
                        key={link.href}
                        render={<a href={link.href} />}
                      >
                        {link.label}
                      </MenuLinkItem>
                    ))}
                  </nav>
                </MenuPopup>
              </Menu>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
