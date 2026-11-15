import type {
  WhatsNewReleaseNotes,
  WhatsNewSectionHeading,
  WhatsNewSections,
} from "./types/whats-new.types"
import { WHATS_NEW_SECTION_HEADINGS } from "./types/whats-new.types"

const VERSION_HEADING = /^## \[([^\]]+)\](?:\s+-\s+(\d{4}-\d{2}-\d{2}))?\s*$/
const SECTION_HEADING = /^###\s+(.+?)\s*$/
const FOOTER_LINK = /^\[.+\]:\s+/
const BULLET = /^\s*[-*]\s+(.+)$/
const allowedHeadings = new Set<string>(WHATS_NEW_SECTION_HEADINGS)

function isSectionHeading(value: string): value is WhatsNewSectionHeading {
  return allowedHeadings.has(value)
}

function collectItems(body: string): string[] {
  const items: string[] = []
  for (const line of body.split("\n")) {
    const bullet = BULLET.exec(line)
    const item = bullet?.[1]?.trim()
    if (item) {
      items.push(item)
    }
  }
  if (items.length === 0) {
    const fallback = body.trim()
    if (fallback) items.push(fallback)
  }
  return items
}

function parseSectionBody(body: string): WhatsNewSections {
  const sections: WhatsNewSections = {}
  let current: WhatsNewSectionHeading | null = null
  const lines: string[] = []

  const flush = () => {
    if (!current) return
    const items = collectItems(lines.join("\n"))
    if (items.length > 0) {
      sections[current] = items
    }
    lines.length = 0
  }

  for (const line of body.split("\n")) {
    if (FOOTER_LINK.test(line)) {
      continue
    }
    const heading = SECTION_HEADING.exec(line)
    if (heading) {
      flush()
      const name = heading[1]?.trim()
      current = name && isSectionHeading(name) ? name : null
      continue
    }
    if (current) {
      lines.push(line)
    }
  }
  flush()
  return sections
}

/** Parse Keep a Changelog markdown into user-facing release entries. */
export function parseChangelog(markdown: string): WhatsNewReleaseNotes[] {
  const lines = markdown.split("\n")
  const entries: WhatsNewReleaseNotes[] = []
  let start = -1
  let version: string | null = null
  let date: string | null = null

  const flush = (end: number) => {
    if (start === -1 || !version || version === "Unreleased") {
      return
    }
    const sections = parseSectionBody(lines.slice(start + 1, end).join("\n"))
    if (Object.keys(sections).length === 0) {
      return
    }
    entries.push({ version, date, sections })
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line === undefined) {
      continue
    }
    if (FOOTER_LINK.test(line)) {
      flush(index)
      start = -1
      version = null
      date = null
      continue
    }
    const heading = VERSION_HEADING.exec(line)
    if (!heading) {
      continue
    }
    flush(index)
    version = heading[1] ?? null
    date = heading[2] ?? null
    start = index
  }
  flush(lines.length)
  return entries
}

/** Return the user-facing notes for one released version, or `null`. */
export function getReleaseNotes(
  version: string,
  markdown: string
): WhatsNewReleaseNotes | null {
  const normalized = version.replace(/^v/, "")
  return (
    parseChangelog(markdown).find((entry) => entry.version === normalized) ??
    null
  )
}
