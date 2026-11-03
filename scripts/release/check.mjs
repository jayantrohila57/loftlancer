#!/usr/bin/env node
// CI guard for release PRs into main: the root version must go up and
// CHANGELOG.md must have a dated section for it.
// Usage: node scripts/release/check.mjs <base-ref>   (e.g. origin/main)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  CHANGELOG_PATH,
  changelogSection,
  compareSemver,
  readVersion,
} from "./changelog.mjs";

const baseRef = process.argv[2] ?? "origin/main";
const baseVersion = JSON.parse(
  execFileSync("git", ["show", `${baseRef}:package.json`], {
    encoding: "utf8",
  }),
).version;
const version = readVersion();
const changelog = readFileSync(CHANGELOG_PATH, "utf8");
const errors = [];

if (compareSemver(version, baseVersion) <= 0) {
  errors.push(
    `package.json version ${version} must be greater than ${baseRef} (${baseVersion}). Run pnpm release:prepare <major|minor|patch>.`,
  );
}
const heading = changelog
  .split("\n")
  .map((line) => line.replace(/\r$/, ""))
  .find((line) => line.startsWith(`## [${version}]`));
if (!heading || !/ - \d{4}-\d{2}-\d{2}$/.test(heading)) {
  errors.push(`CHANGELOG.md needs a "## [${version}] - YYYY-MM-DD" section.`);
} else if (!changelogSection(changelog, version)) {
  errors.push(`CHANGELOG.md section ${version} is empty.`);
}

if (errors.length) {
  for (const error of errors) console.error(`release check: ${error}`);
  process.exit(1);
}
console.log(`release check: ${baseVersion} -> ${version} with changelog entry`);
