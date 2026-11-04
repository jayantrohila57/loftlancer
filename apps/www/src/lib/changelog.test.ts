import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseChangelog } from "./changelog";

const sample = `# Changelog

Intro text.

## [Unreleased]

## [1.1.0] - 2026-10-15

The product is now Loftlancer.

### Added

- Thing one (#1)
- Thing two

### Fixed

- Bug (#2)

## [1.0.0] - 2026-10-14

### Changed

- Rename

[Unreleased]: https://example.com
[1.1.0]: https://example.com
`;

describe("parseChangelog", () => {
  it("parses versions, dates, summaries and groups", () => {
    const releases = parseChangelog(sample);
    assert.deepEqual(
      releases.map((r) => r.version),
      ["1.1.0", "1.0.0"],
    );
    assert.equal(releases[0]?.date, "2026-10-15");
    assert.equal(releases[0]?.summary, "The product is now Loftlancer.");
    assert.deepEqual(releases[0]?.groups, [
      { label: "Added", items: ["Thing one (#1)", "Thing two"] },
      { label: "Fixed", items: ["Bug (#2)"] },
    ]);
    assert.deepEqual(releases[1]?.groups, [
      { label: "Changed", items: ["Rename"] },
    ]);
  });

  it("parses the repository CHANGELOG", async () => {
    const { readFile } = await import("node:fs/promises");
    const text = await readFile(
      new URL("../../../../CHANGELOG.md", import.meta.url),
      "utf8",
    );
    const releases = parseChangelog(text);
    assert.ok(releases.some((r) => r.version === "1.0.0"));
    assert.ok(releases.some((r) => r.version === "0.1.0"));
    for (const release of releases) {
      if (release.version !== "Unreleased") {
        assert.match(release.date ?? "", /^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
