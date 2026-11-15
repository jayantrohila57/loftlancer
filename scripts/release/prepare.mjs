#!/usr/bin/env node
// Usage: node scripts/release/prepare.mjs <major|minor|patch>
// Bumps the root version and turns `## [Unreleased]` into a dated release
// section. Commit the result on a release branch, merge it into loftlancer-development, then open
// the loftlancer-development -> loftlancer-production release PR. No git operations happen here.
import { readFileSync, writeFileSync } from "node:fs"
import {
  bumpVersion,
  CHANGELOG_PATH,
  changelogSection,
  PACKAGE_PATH,
  readVersion,
  repoUrl,
  todayIst,
  validateUserFacingChangelog,
} from "./changelog.mjs"

const kind = process.argv[2]
if (!kind) {
  console.error("Usage: pnpm release:prepare <major|minor|patch>")
  process.exit(1)
}

const current = readVersion()
const next = bumpVersion(current, kind)
const REPO_URL = repoUrl()
const changelog = readFileSync(CHANGELOG_PATH, "utf8")

const unreleased = changelogSection(changelog, "Unreleased")
if (!unreleased) {
  console.error("CHANGELOG.md has no entries under ## [Unreleased].")
  process.exit(1)
}
const unreleasedErrors = validateUserFacingChangelog(unreleased)
if (unreleasedErrors.length) {
  for (const error of unreleasedErrors) {
    console.error(`CHANGELOG.md ## [Unreleased]: ${error}`)
  }
  process.exit(1)
}
if (changelog.includes(`## [${next}]`)) {
  console.error(`CHANGELOG.md already has a ${next} section.`)
  process.exit(1)
}

let updated = changelog.replace(
  "## [Unreleased]",
  `## [Unreleased]\n\n## [${next}] - ${todayIst()}`
)
updated = updated.replace(
  /^\[Unreleased\]: .*$/m,
  `[Unreleased]: ${REPO_URL}/compare/v${next}...HEAD\n[${next}]: ${REPO_URL}/compare/v${current}...v${next}`
)
writeFileSync(CHANGELOG_PATH, updated)

const pkgSource = readFileSync(PACKAGE_PATH, "utf8")
const pkg = JSON.parse(pkgSource)
const eol = pkgSource.includes("\r\n") ? "\r\n" : "\n"
pkg.version = next
writeFileSync(
  PACKAGE_PATH,
  `${JSON.stringify(pkg, null, 2).replace(/\n/g, eol)}${eol}`
)

console.log(`Version ${current} -> ${next}. Review CHANGELOG.md, then commit:`)
console.log(`  git commit -am "chore(release): v${next}"`)
