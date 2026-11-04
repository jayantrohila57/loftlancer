import { VersionBadge } from "@features/patterns/core/client/patterns.version-badge";
import { docsUrl } from "@features/shell/utils/shell.platform-urls.utils";
import { cn } from "@loftlancer/ui/utils";

const LINKS = () =>
  [
    { label: "Documentation", href: docsUrl() },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Status", href: "/status" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ] as const;

/** Compact public-site footer: page links and the product version (#368, #369). */
export function SiteFooter({ className }: { className?: string }) {
  const links = LINKS();
  return (
    <footer
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs",
        className,
      )}
    >
      <nav aria-label="Site" className="flex flex-wrap gap-x-3 gap-y-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            // 24px hit area (WCAG 2.5.8, #390); -my-1 keeps the 16px line box.
            className="hover:text-foreground -my-1 inline-flex min-h-6 items-center transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <VersionBadge className="ml-auto" />
    </footer>
  );
}
