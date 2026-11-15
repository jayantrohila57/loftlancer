#!/usr/bin/env node
/**
 * Generate Studio PWA icons, placeholder screenshots, and sync site.webmanifest.
 *
 *   pnpm --filter studio generate:pwa-assets
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const studioRoot = path.join(root, "apps/studio")
const faviconDir = path.join(studioRoot, "public/favicon")
const manifestJsonPath = path.join(
  studioRoot,
  "src/shared/config/studio.pwa.manifest.json"
)
const siteManifestPath = path.join(faviconDir, "site.webmanifest")

const require = createRequire(import.meta.url)
const sharp = require(path.join(studioRoot, "node_modules/sharp"))

const theme = "#262626"
const mark = "#fafafa"
const background = "#ffffff"

const iconPaths = `
  <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/>
  <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/>
  <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>
`

function anyPurposeSvg(size) {
  const pad = Math.round(size * 0.18)
  const inner = size - pad * 2
  const scale = inner / 24
  const tx = pad
  const ty = pad
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${background}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})" fill="none" stroke="${theme}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${iconPaths}
  </g>
</svg>`
}

function maskableSvg(size) {
  const scale = size / 24
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${theme}"/>
  <g transform="scale(${scale})" fill="none" stroke="${mark}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${iconPaths}
  </g>
</svg>`
}

function placeholderScreenshotSvg(width, height, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${background}"/>
  <rect x="0" y="0" width="${width}" height="72" fill="${theme}"/>
  <text x="32" y="46" fill="${mark}" font-family="system-ui, sans-serif" font-size="28" font-weight="600">${title}</text>
  <rect x="32" y="120" width="${Math.min(width - 64, 480)}" height="24" rx="4" fill="#e5e5e5"/>
  <rect x="32" y="168" width="${Math.min(width - 64, 720)}" height="16" rx="4" fill="#f5f5f5"/>
  <rect x="32" y="200" width="${Math.min(width - 64, 640)}" height="16" rx="4" fill="#f5f5f5"/>
</svg>`
}

async function writePngFromSvg(svg, file, resize) {
  let pipeline = sharp(Buffer.from(svg))
  if (resize) {
    pipeline = pipeline.resize(resize, resize)
  }
  await writeFile(file, await pipeline.png().toBuffer())
}

async function assertOpaque(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  })
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) {
      throw new Error(`${file}: maskable icon must be fully opaque`)
    }
  }
  if (info.width !== info.height) {
    throw new Error(`${file}: maskable icon must be square`)
  }
}

await mkdir(faviconDir, { recursive: true })

const manifestSizes = [192, 512]
for (const size of manifestSizes) {
  await writePngFromSvg(
    anyPurposeSvg(size),
    path.join(faviconDir, `web-app-manifest-${size}x${size}.png`),
    size
  )
  const maskableFile = path.join(
    faviconDir,
    `web-app-manifest-maskable-${size}x${size}.png`
  )
  await writePngFromSvg(maskableSvg(size), maskableFile, size)
  await assertOpaque(maskableFile)
}

await writePngFromSvg(
  anyPurposeSvg(96),
  path.join(faviconDir, "favicon-96x96.png"),
  96
)
await writePngFromSvg(
  anyPurposeSvg(180),
  path.join(faviconDir, "apple-touch-icon.png"),
  180
)

await writePngFromSvg(
  placeholderScreenshotSvg(1200, 630, "Studio"),
  path.join(faviconDir, "screenshot-wide.png")
)
await writePngFromSvg(
  placeholderScreenshotSvg(390, 844, "Studio"),
  path.join(faviconDir, "screenshot-narrow.png")
)

const manifest = JSON.parse(await readFile(manifestJsonPath, "utf8"))
await writeFile(siteManifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log("Wrote Studio PWA assets to apps/studio/public/favicon/")
