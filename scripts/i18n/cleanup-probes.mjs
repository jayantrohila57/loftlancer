import { globSync, unlinkSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

for (const pattern of ["**/.i18n-rule-*.tsx", "**/i18n-rule-probe.*.tsx"]) {
  for (const relativePath of globSync(pattern, {
    cwd: root,
    exclude: ["node_modules/**", ".next/**", "dist/**"],
  })) {
    unlinkSync(resolve(root, relativePath))
  }
}
