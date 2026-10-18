#!/usr/bin/env node
/**
 * Generate full-bleed PWA maskable icons (theme #262626, Layers mark #fafafa).
 *
 *   pnpm exec tsx scripts/generate-pwa-maskable-icons.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const sharp = require(
  path.join(root, "apps/studio/node_modules/sharp"),
) as typeof import("sharp");

const maskableSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#262626"/>
  <g transform="translate(97.28 97.28) scale(13.2267)" fill="none" stroke="#fafafa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/>
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/>
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>
  </g>
</svg>`;

const faviconDirs = [
  "apps/studio/public/favicon",
  "apps/auth/public/favicon",
  "apps/docs/public/favicon",
].map((p) => path.join(root, p));

const sizes = [192, 512] as const;

async function writeMaskablePng(dir: string, size: number) {
  const file = path.join(dir, `web-app-manifest-maskable-${size}x${size}.png`);
  const png = await sharp(Buffer.from(maskableSvg))
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(file, png);
}

async function assertOpaque(file: string) {
  const { channels } = await sharp(file).metadata();
  if (channels !== 3 && channels !== 4) return;
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) {
      throw new Error(
        `${file}: maskable icon must be fully opaque (alpha at ${i})`,
      );
    }
  }
  if (info.width !== info.height) {
    throw new Error(`${file}: maskable icon must be square`);
  }
}

for (const dir of faviconDirs) {
  await mkdir(dir, { recursive: true });
  for (const size of sizes) {
    await writeMaskablePng(dir, size);
    await assertOpaque(
      path.join(dir, `web-app-manifest-maskable-${size}x${size}.png`),
    );
  }
}

console.log(
  "Wrote maskable PWA icons to auth, docs, and studio favicon folders.",
);
