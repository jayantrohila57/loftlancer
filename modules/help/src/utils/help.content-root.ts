import { existsSync } from "node:fs"
import { resolve } from "node:path"

const contentDirName = "content/help"

/** Resolve git-managed help articles from the monorepo root or auth app cwd. */
export function helpContentRoot(): string {
  const cwd = process.cwd()
  const fromAuthApp = resolve(cwd, "../../", contentDirName)
  if (existsSync(fromAuthApp)) {
    return fromAuthApp
  }
  const fromRepoRoot = resolve(cwd, contentDirName)
  if (existsSync(fromRepoRoot)) {
    return fromRepoRoot
  }
  return fromAuthApp
}
