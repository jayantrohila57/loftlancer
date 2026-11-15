#!/usr/bin/env node
// Usage: node scripts/release/notes.mjs [version]
// Prints the user-facing CHANGELOG.md section for a version
// (default: package.json). Only Added, Changed, Removed, and Breaking.
import { readFileSync } from "node:fs"
import {
  CHANGELOG_PATH,
  changelogSection,
  formatUserFacingChangelog,
  readVersion,
  validateUserFacingChangelog,
} from "./changelog.mjs"

const version = (process.argv[2] ?? readVersion()).replace(/^v/, "")
const section = changelogSection(readFileSync(CHANGELOG_PATH, "utf8"), version)
if (!section) {
  console.error(`No CHANGELOG.md section for ${version}`)
  process.exit(1)
}
const errors = validateUserFacingChangelog(section)
if (errors.length) {
  for (const error of errors) {
    console.error(`release notes: ${error}`)
  }
  process.exit(1)
}
process.stdout.write(`${formatUserFacingChangelog(section)}\n`)
