#!/usr/bin/env node
/**
 * Codex Stop hook: if this turn touched module/oRPC/app pages, require architecture audit pass.
 * Emits JSON continuation when audit fails (see https://developers.openai.com/codex/guides/hooks).
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SENSITIVE =
  /^(module\/|packages\/api\/src\/orpc\/|apps\/[^/]+\/src\/app\/.*\/page\.tsx)/;

let input = {};
try {
  const raw = readFileSync(0, "utf8");
  if (raw.trim()) input = JSON.parse(raw);
} catch {
  process.exit(0);
}

if (input.stop_hook_active === true) {
  process.exit(0);
}

let root;
try {
  root = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
} catch {
  process.exit(0);
}

const listCmd =
  "git diff --name-only HEAD 2>/dev/null; git diff --name-only --cached 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null";
const files = execSync(listCmd, { cwd: root, encoding: "utf8" })
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

if (!files.some((f) => SENSITIVE.test(f))) {
  process.exit(0);
}

try {
  execSync("pnpm audit:module-architecture", { cwd: root, stdio: "pipe" });
  process.exit(0);
} catch {
  process.stdout.write(
    `${JSON.stringify({
      decision: "block",
      reason:
        "Architecture audit failed. Run `pnpm audit:module-architecture`, fix NEW violations (no z.unknown(), no legacy templates, controllers need serviceResponseSchema.parse). Before PR: `pnpm verify:dev-merge`. Read module/<domain>/README.md and root AGENTS.md strict workflow.",
    })}\n`,
  );
  process.exit(0);
}
