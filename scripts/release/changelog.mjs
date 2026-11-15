// Shared helpers for CHANGELOG.md (Keep a Changelog) used by the release scripts.
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

export const CHANGELOG_PATH = new URL("../../CHANGELOG.md", import.meta.url)
export const PACKAGE_PATH = new URL("../../package.json", import.meta.url)

export const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/

/**
 * User-facing changelog groups. `Changed` is only for behavior users can see,
 * not refactors or internal rewrites. `Breaking` is an explicit group for
 * incompatible changes (not a stock Keep a Changelog heading).
 */
export const USER_FACING_SECTION_HEADINGS = [
  "Added",
  "Changed",
  "Removed",
  "Breaking",
]

/** Conventional-commit types that must not be auto-collected into the changelog. */
export const INTERNAL_COMMIT_TYPES = [
  "chore",
  "refactor",
  "style",
  "test",
  "ci",
  "build",
  "docs",
]

const SECTION_HEADING = /^###\s+(.+?)\s*$/
const CONVENTIONAL_COMMIT = /^(\w+)(?:\([^)]+\))?(!)?:/

/** GitHub repo URL for compare links (override with RELEASE_REPO_URL). */
export function repoUrl() {
  const fromEnv = process.env.RELEASE_REPO_URL?.replace(/\/$/, "")
  if (fromEnv) return fromEnv
  try {
    const raw = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
    }).trim()
    const ssh = /^git@github\.com:(.+?)(?:\.git)?$/i.exec(raw)
    if (ssh) return `https://github.com/${ssh[1]}`
    const https = /^https:\/\/github\.com\/(.+?)(?:\.git)?$/i.exec(raw)
    if (https) return `https://github.com/${https[1]}`
  } catch {
    // no origin remote
  }
  return "https://github.com/white-ai/loftlancer-template"
}

export function readVersion() {
  return JSON.parse(readFileSync(PACKAGE_PATH, "utf8")).version
}

export function parseSemver(version) {
  const match = SEMVER.exec(version)
  if (!match) throw new Error(`Not a semver version: ${version}`)
  return match.slice(1, 4).map(Number)
}

export function compareSemver(a, b) {
  const [pa, pb] = [parseSemver(a), parseSemver(b)]
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

export function bumpVersion(version, kind) {
  const [major, minor, patch] = parseSemver(version)
  if (kind === "major") return `${major + 1}.0.0`
  if (kind === "minor") return `${major}.${minor + 1}.0`
  if (kind === "patch") return `${major}.${minor}.${patch + 1}`
  throw new Error(`Release type must be major, minor or patch (got ${kind})`)
}

/** Body (without the heading) of one `## [version]` section, or null. */
export function changelogSection(text, version) {
  const lines = text.split("\n")
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`))
  if (start === -1) return null
  let end = lines.findIndex(
    (line, i) =>
      i > start && (line.startsWith("## [") || /^\[.+\]: /.test(line))
  )
  if (end === -1) end = lines.length
  return lines
    .slice(start + 1, end)
    .join("\n")
    .trim()
}

/**
 * Split a section body into `###` groups. Scripts never rewrite entry text
 * and do not auto-collect git commits.
 */
export function parseChangelogGroups(sectionBody) {
  const groups = new Map()
  const preamble = []
  let current = null

  for (const line of sectionBody.split("\n")) {
    const heading = SECTION_HEADING.exec(line)
    if (heading) {
      current = heading[1].trim()
      if (!groups.has(current)) groups.set(current, [])
      continue
    }
    if (current) {
      groups.get(current).push(line)
    } else if (line.trim()) {
      preamble.push(line)
    }
  }

  const trimmed = new Map()
  for (const [heading, lines] of groups) {
    const body = lines.join("\n").trim()
    if (body) trimmed.set(heading, body)
  }
  return { preamble: preamble.join("\n").trim(), groups: trimmed }
}

/** Conventional commits such as `chore:` or `docs:` are not user-facing. */
export function isUserFacingCommit(subject) {
  const match = CONVENTIONAL_COMMIT.exec(subject.trim())
  if (!match) return true
  const type = match[1].toLowerCase()
  if (match[2] === "!") return true
  return !INTERNAL_COMMIT_TYPES.includes(type)
}

export function formatUserFacingChangelog(sectionBody) {
  const { groups } = parseChangelogGroups(sectionBody)
  const parts = []
  for (const heading of USER_FACING_SECTION_HEADINGS) {
    const body = groups.get(heading)
    if (!body) continue
    parts.push(`### ${heading}\n\n${body}`)
  }
  return parts.join("\n\n")
}

/** Returns human-readable problems, or an empty array if the section is valid. */
export function validateUserFacingChangelog(sectionBody) {
  const errors = []
  if (!sectionBody?.trim()) {
    errors.push(
      "section is empty. Add a user-facing entry under Added, Changed, Removed, or Breaking."
    )
    return errors
  }

  const { preamble, groups } = parseChangelogGroups(sectionBody)
  if (preamble) {
    errors.push(
      "text appears outside a user-facing heading. Put entries under ### Added, ### Changed, ### Removed, or ### Breaking."
    )
  }

  const allowed = new Set(USER_FACING_SECTION_HEADINGS)
  const disallowed = [...groups.keys()].filter(
    (heading) => !allowed.has(heading)
  )
  if (disallowed.length) {
    errors.push(
      `unsupported heading(s): ${disallowed.join(", ")}. Use only Added, Changed (user-visible behavior), Removed, and Breaking. Leave out Fixed, Security, and internal-only groups.`
    )
  }

  const hasEntry = USER_FACING_SECTION_HEADINGS.some((heading) =>
    groups.has(heading)
  )
  if (!hasEntry) {
    errors.push(
      "needs at least one user-facing entry under Added, Changed, Removed, or Breaking."
    )
  }

  return errors
}

/** Today's date in IST (release timezone), YYYY-MM-DD. */
export function todayIst(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}
