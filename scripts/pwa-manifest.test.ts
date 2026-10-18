import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const sharp = require(
  path.join(root, "apps/studio/node_modules/sharp"),
) as typeof import("sharp");

type ManifestIcon = {
  src: string;
  sizes: string;
  purpose?: string;
};

type ManifestScreenshot = {
  src: string;
  sizes: string;
};

type WebManifest = {
  icons?: ManifestIcon[];
  screenshots?: ManifestScreenshot[];
};

const apps = [
  { name: "auth", manifest: "apps/auth/public/favicon/site.webmanifest" },
  { name: "docs", manifest: "apps/docs/public/favicon/site.webmanifest" },
  { name: "studio", manifest: "apps/studio/public/favicon/site.webmanifest" },
] as const;

function publicFile(manifestRel: string, manifestSrc: string) {
  const publicRoot = path.join(root, path.dirname(manifestRel), "..");
  const rel = manifestSrc.replace(/^\//, "");
  return path.join(publicRoot, rel);
}

async function pngSize(file: string) {
  const meta = await sharp(file).metadata();
  assert.ok(meta.width && meta.height, `${file}: missing dimensions`);
  return `${meta.width}x${meta.height}`;
}

describe("PWA static manifests", () => {
  for (const app of apps) {
    it(`${app.name} site.webmanifest paths and sizes match files`, async () => {
      const manifestPath = path.join(root, app.manifest);
      const manifest = JSON.parse(
        await readFile(manifestPath, "utf8"),
      ) as WebManifest;

      for (const icon of manifest.icons ?? []) {
        assert.match(
          icon.src,
          /^\/favicon\//,
          `${app.name} icon src must use /favicon/`,
        );
        const file = publicFile(app.manifest, icon.src);
        const size = await pngSize(file);
        assert.equal(icon.sizes, size, `${app.name} icon ${icon.src}`);
        if (icon.purpose === "maskable") {
          assert.match(
            icon.src,
            /maskable/,
            `${app.name} maskable icon should use dedicated maskable asset`,
          );
        }
      }

      for (const shot of manifest.screenshots ?? []) {
        assert.match(
          shot.src,
          /^\/favicon\//,
          `${app.name} screenshot src must use /favicon/`,
        );
        const file = publicFile(app.manifest, shot.src);
        const size = await pngSize(file);
        assert.equal(shot.sizes, size, `${app.name} screenshot ${shot.src}`);
      }
    });
  }

  it("studio og-image is served from public root", async () => {
    const og = path.join(root, "apps/studio/public/og-image.png");
    const size = await pngSize(og);
    assert.equal(size, "1200x630");
  });
});
