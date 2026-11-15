import { readFileSync } from "node:fs"

import "server-only"

import type { WhatsNewReleaseNotes } from "../utils/types/whats-new.types"
import { whatsNewChangelogPath } from "../utils/whats-new.changelog-root"
import { getReleaseNotes, parseChangelog } from "../utils/whats-new.parser"

function readChangelogMarkdown(): string {
  return readFileSync(whatsNewChangelogPath(), "utf8")
}

export function loadWhatsNewReleases(): WhatsNewReleaseNotes[] {
  return parseChangelog(readChangelogMarkdown())
}

export function loadReleaseNotes(version: string): WhatsNewReleaseNotes | null {
  return getReleaseNotes(version, readChangelogMarkdown())
}
