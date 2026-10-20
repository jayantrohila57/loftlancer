import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

/**
 * Product version badge (#368). The version is the root package.json version,
 * inlined at build time by each app's next.config as NEXT_PUBLIC_APP_VERSION.
 * Links to the public changelog.
 */
export function appVersion(): string | null {
  return process.env.NEXT_PUBLIC_APP_VERSION?.trim() || null;
}

export function VersionBadge({
  href = "/changelog",
  className,
}: {
  href?: string;
  className?: string;
}) {
  const version = appVersion();
  if (!version) return null;
  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn("font-mono text-muted-foreground tabular-nums", className)}
      render={<a href={href} aria-label={`v${version}, view the changelog`} />}
    >
      v{version}
    </Badge>
  );
}
