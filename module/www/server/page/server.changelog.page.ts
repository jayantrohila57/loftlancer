import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * CHANGELOG.md (Keep a Changelog) is the single source for release notes:
 * /changelog, the version badge and GitHub Releases all read it (#368).
 */

export type ChangeGroup = {
  /** Keep a Changelog heading: Added, Changed, Fixed, Removed, Security… */
  label: string;
  items: string[];
};

export type ChangelogRelease = {
  version: string;
  /** YYYY-MM-DD (IST) or null for Unreleased. */
  date: string | null;
  summary: string | null;
  groups: ChangeGroup[];
};

const RELEASE_HEADING = /^## \[([^\]]+)\](?:\s+-\s+(\d{4}-\d{2}-\d{2}))?/;

export function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let release: ChangelogRelease | null = null;
  let group: ChangeGroup | null = null;
  const summary: string[] = [];

  const finishSummary = () => {
    if (release && summary.length > 0 && release.summary === null) {
      release.summary = summary.join(" ").trim() || null;
    }
    summary.length = 0;
  };

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    const heading = RELEASE_HEADING.exec(line);
    if (heading) {
      finishSummary();
      release = {
        version: heading[1] ?? "",
        date: heading[2] ?? null,
        summary: null,
        groups: [],
      };
      group = null;
      releases.push(release);
      continue;
    }
    if (!release) continue;
    // Link reference definitions close the last release.
    if (/^\[[^\]]+\]: /.test(line)) {
      finishSummary();
      release = null;
      continue;
    }
    if (line.startsWith("### ")) {
      finishSummary();
      group = { label: line.slice(4).trim(), items: [] };
      release.groups.push(group);
      continue;
    }
    const item = /^- (.*)$/.exec(line);
    if (item && group) {
      group.items.push(item[1]?.trim() ?? "");
      continue;
    }
    if (!group && line.trim()) summary.push(line.trim());
  }
  finishSummary();

  return releases.filter(
    (entry) => entry.groups.some((g) => g.items.length > 0) || entry.summary,
  );
}

export async function loadChangelog(): Promise<ChangelogRelease[]> {
  try {
    const markdown = await readFile(
      join(process.cwd(), "../../CHANGELOG.md"),
      "utf8",
    );
    return parseChangelog(markdown);
  } catch {
    return [];
  }
}
