import { Badge, type BadgeProps } from "@loftlancer/ui/badge";
import { cn } from "@loftlancer/ui/utils";
import { Fragment, type ReactNode } from "react";

import { MarketingPage } from "@/components/marketing-page";
import { type ChangelogRelease, loadChangelog } from "@/lib/changelog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Changelog",
  description:
    "Every Loftlancer release, from the first env-manager commit to today, with what was added, changed and fixed.",
  path: "/changelog",
});

const REPO = "https://github.com/jayantrohila57/loftlancer";

/** Keep changelog badges aligned with their Keep a Changelog headings. */
const GROUP_TAGS: Record<
  string,
  { label: string; variant: BadgeProps["variant"] }
> = {
  Added: { label: "Added", variant: "success" },
  Changed: { label: "Changed", variant: "info" },
  Fixed: { label: "Fixed", variant: "warning" },
  Security: { label: "Security", variant: "error" },
  Removed: { label: "Removed", variant: "secondary" },
  Deprecated: { label: "Deprecated", variant: "secondary" },
};

function groupTag(label: string) {
  return GROUP_TAGS[label] ?? { label, variant: "outline" as const };
}

function formatDate(date: string): string {
  // Dates are calendar days (IST); format without shifting time zones.
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Inline markdown used in CHANGELOG.md: `code`, **bold**, #123 refs. */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|#\d+)/g);
  return parts.map((part, index) => {
    const key = `${index}-${part}`;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-muted px-1 text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^#\d+$/.test(part)) {
      return (
        <a
          key={key}
          href={`${REPO}/issues/${part.slice(1)}`}
          className="text-muted-foreground tabular-nums underline-offset-2 hover:text-foreground hover:underline"
        >
          {part}
        </a>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function ReleaseItem({
  release,
  latest,
}: {
  release: ChangelogRelease;
  latest: boolean;
}) {
  const unreleased = release.version === "Unreleased";
  const title = unreleased ? "Unreleased" : `v${release.version}`;
  const id = unreleased ? "unreleased" : `v${release.version}`;

  return (
    <li
      id={id}
      className="relative grid scroll-mt-8 gap-1.5 pb-8 last:pb-0 sm:grid-cols-[7rem_1fr] sm:gap-4"
    >
      {/* Date rail */}
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:block sm:pt-0.5 sm:text-right">
        {release.date ? (
          <time dateTime={release.date} className="tabular-nums">
            {formatDate(release.date)}
          </time>
        ) : (
          <span>Next release</span>
        )}
      </div>

      {/* Node + connector + content */}
      <div className="relative border-border/60 border-l pl-5 sm:pb-0">
        <span
          aria-hidden
          className={cn(
            "absolute top-1 -left-[5px] size-2.5 rounded-full border-2 bg-background",
            latest || unreleased ? "border-primary" : "border-border",
          )}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <h2 className="font-semibold text-sm">
            {unreleased ? (
              title
            ) : (
              <a
                href={`${REPO}/releases/tag/${id}`}
                className="hover:underline"
              >
                {title}
              </a>
            )}
          </h2>
          {latest ? (
            <Badge variant="default" size="sm">
              Latest
            </Badge>
          ) : null}
          {release.groups.map((group) => {
            const tag = groupTag(group.label);
            return (
              <Badge key={group.label} variant={tag.variant} size="sm">
                {tag.label}
                <span className="tabular-nums">{group.items.length}</span>
              </Badge>
            );
          })}
        </div>
        {release.summary ? (
          <p className="mt-1 text-muted-foreground text-sm">
            {renderInline(release.summary)}
          </p>
        ) : null}
        <div className="mt-3 flex flex-col gap-3">
          {release.groups.map((group) => {
            const tag = groupTag(group.label);
            return (
              <section key={group.label} className="flex flex-col gap-1.5">
                <h3 className="font-medium text-muted-foreground text-xs">
                  {group.label}
                </h3>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-foreground/90 text-sm leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-2 size-1.5 shrink-0 rounded-full",
                          tag.variant === "success" && "bg-success",
                          tag.variant === "info" && "bg-info",
                          tag.variant === "warning" && "bg-warning",
                          tag.variant === "error" && "bg-destructive",
                          (tag.variant === "secondary" ||
                            tag.variant === "outline") &&
                            "bg-muted-foreground",
                        )}
                      />
                      <span className="min-w-0">{renderInline(item)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </li>
  );
}

/**
 * Release history rendered from CHANGELOG.md at build time (#368), laid out
 * after ReUI timeline-5 (Release Changelog): a date rail, one timeline node
 * per version, type tags with counts, then Added / Changed / Fixed groups.
 */
export default async function ChangelogPage() {
  // Only dated releases; [Unreleased] is folded into a version at release time.
  const releases = (await loadChangelog()).filter((r) => r.date);
  const latestVersion = releases[0]?.version;

  return (
    <MarketingPage
      title="Changelog"
      description="Every Loftlancer release since the first commit. Versions 0.x cover earlier product names; 1.0.0 marks the Loftlancer name."
    >
      {releases.length === 0 ? (
        <p className="not-prose text-muted-foreground text-sm">
          Release notes are on <a href={`${REPO}/releases`}>GitHub Releases</a>.
        </p>
      ) : (
        <ol className="not-prose" data-testid="changelog-timeline">
          {releases.map((release) => (
            <ReleaseItem
              key={release.version}
              release={release}
              latest={release.version === latestVersion}
            />
          ))}
        </ol>
      )}
    </MarketingPage>
  );
}
