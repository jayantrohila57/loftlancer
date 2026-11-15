import { readdir, readFile } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { isPresentationFile, validatePresentation } from "./rules.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const ignoredDirectories = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
  ".git",
])

async function* sources(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      yield* sources(path)
    } else if (entry.isFile() && isPresentationFile(relative(root, path))) {
      yield path
    }
  }
}

let count = 0
for (const layer of ["apps", "modules", "features", "packages"]) {
  for await (const path of sources(join(root, layer))) {
    const diagnostics = validatePresentation(
      relative(root, path),
      await readFile(path, "utf8")
    )
    for (const diagnostic of diagnostics) {
      console.error(
        `${diagnostic.file}:${diagnostic.line}:${diagnostic.column} error i18n/${diagnostic.rule}: ${diagnostic.message}`
      )
      count += 1
    }
  }
}

if (count > 0) {
  console.error(`i18n validation failed: ${count} error(s).`)
  process.exitCode = 1
} else {
  console.log("i18n presentation formatting checks passed.")
}
