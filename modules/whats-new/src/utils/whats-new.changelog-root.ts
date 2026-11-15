import { existsSync } from "node:fs"
import { resolve } from "node:path"

/** Resolve root CHANGELOG.md from the monorepo root or the web app cwd. */
export function whatsNewChangelogPath(): string {
  const cwd = process.cwd()
  const fromWebApp = resolve(cwd, "../../CHANGELOG.md")
  if (existsSync(fromWebApp)) {
    return fromWebApp
  }
  const fromRepoRoot = resolve(cwd, "CHANGELOG.md")
  if (existsSync(fromRepoRoot)) {
    return fromRepoRoot
  }
  return fromWebApp
}
