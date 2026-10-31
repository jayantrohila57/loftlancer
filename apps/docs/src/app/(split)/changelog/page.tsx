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

function formatDate(date: string): string {
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
        <code key={key} className="rounded-sm bg-muted px-1 font-mono text-xs">
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
      className="grid scroll-mt-28 gap-3 border-border/70 border-b py-7 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8 md:py-9"
    >
      <div className="font-mono text-[11px] text-muted-foreground tabular-nums sm:pt-1">
        {release.date ? (
          <time dateTime={release.date}>{formatDate(release.date)}</time>
        ) : (
          <span>Next release</span>
        )}
      </div>
      <article>
        <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="mt-0! border-0! pb-0! font-medium! text-2xl! tracking-[-0.05em]! md:text-3xl!">
            {unreleased ? (
              title
            ) : (
              <a
                href={`${REPO}/releases/tag/${id}`}
                className="decoration-border underline-offset-4 hover:underline"
              >
                {title}
              </a>
            )}
          </h2>
          {latest ? (
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
              Latest release
            </span>
          ) : null}
        </header>
        {release.summary ? (
          <p className="mt-2 max-w-3xl text-muted-foreground leading-6">
            {renderInline(release.summary)}
          </p>
        ) : null}
        <div
          className={cn(
            "mt-6 grid gap-x-8 gap-y-5",
            release.groups.length > 1 && "sm:grid-cols-2",
          )}
        >
          {release.groups.map((group) => (
            <section
              key={group.label}
              className="border-border/70 border-t pt-3"
            >
              <h3 className="mt-0! mb-2! border-0! pb-0! font-mono! text-[10px]! text-muted-foreground! uppercase tracking-[0.1em]!">
                {group.label}{" "}
                <span className="tabular-nums">/ {group.items.length}</span>
              </h3>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-2 text-foreground/90 text-sm leading-6"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.65rem] size-1 rounded-full bg-muted-foreground/60"
                    />
                    <span className="min-w-0">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>
    </li>
  );
}

export default async function ChangelogPage() {
  const releases = (await loadChangelog()).filter((release) => release.date);
  const latestVersion = releases[0]?.version;

  return (
    <MarketingPage
      eyebrow="Product / Release notes"
      title="Release notes"
      description="A dated record of product releases, with additions, changes, and fixes from the project history."
    >
      {releases.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Release notes are on <a href={`${REPO}/releases`}>GitHub Releases</a>.
        </p>
      ) : (
        <ol data-testid="changelog-timeline">
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
