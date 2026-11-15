/** Semantic theme tokens from `globals.css` (`:root` / `.dark`). */
export type ThemeColorToken =
  | "background"
  | "foreground"
  | "card"
  | "primary"
  | "secondary"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "destructive"
  | "info"
  | "info-foreground"
  | "success"
  | "success-foreground"
  | "warning"
  | "warning-foreground"
  | "border"
  | "ring"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"

const MAP_LIBRE_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const RGB_COLOR = /^rgba?\(/i

/** Tailwind `blue-*` defaults referenced by `--info` in `globals.css`. */
const THEME_PAINT_FALLBACKS: Partial<Record<ThemeColorToken, string>> = {
  info: "#3b82f6",
  "info-foreground": "#1d4ed8",
}

function isMapLibreSafe(color: string): boolean {
  const trimmed = color.trim()
  return MAP_LIBRE_COLOR.test(trimmed) || RGB_COLOR.test(trimmed)
}

function clampByte(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function linearToSrgb(channel: number): number {
  if (channel <= 0.0031308) return 12.92 * channel
  return 1.055 * channel ** (1 / 2.4) - 0.055
}

function rgbBytesToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clampByte(n).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function labToLinearSrgb(
  l: number,
  a: number,
  b: number
): [number, number, number] | null {
  if (!Number.isFinite(l) || !Number.isFinite(a) || !Number.isFinite(b)) {
    return null
  }

  const fy = (l + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200

  const f = (t: number) => (t > 0.206897 ? t ** 3 : (t - 16 / 116) / 7.787)

  const xr = f(fx)
  const yr = l > 8 ? ((l + 16) / 116) ** 3 : l / 903.3
  const zr = f(fz)

  const x = 0.95047 * xr
  const y = 1 * yr
  const z = 1.08883 * zr

  const r = x * 3.2406 + y * -1.5372 + z * -0.4986
  const g = x * -0.9689 + y * 1.8758 + z * 0.0415
  const bl = x * 0.0557 + y * -0.204 + z * 1.057

  return [r, g, bl]
}

function oklchToLinearSrgb(
  l: number,
  c: number,
  hDeg: number
): [number, number, number] | null {
  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(hDeg)) {
    return null
  }

  const hRad = (hDeg * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const l3 = l_ ** 3
  const m3 = m_ ** 3
  const s3 = s_ ** 3

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

  return [r, g, bl]
}

function linearSrgbToHex(rgb: [number, number, number]): string {
  const [lr, lg, lb] = rgb
  const r = linearToSrgb(lr)
  const g = linearToSrgb(lg)
  const b = linearToSrgb(lb)
  return rgbBytesToHex(r * 255, g * 255, b * 255)
}

function parseCssNumber(token: string): number | null {
  const trimmed = token.trim()
  if (!trimmed) return null
  const value = Number.parseFloat(trimmed)
  return Number.isFinite(value) ? value : null
}

function parseLabLightness(token: string): number | null {
  const trimmed = token.trim()
  const isPercent = trimmed.endsWith("%")
  return parseCssNumber(isPercent ? trimmed.slice(0, -1) : trimmed)
}

function convertLabString(color: string): string | null {
  const match = color.trim().match(/^lab\(/i)
  if (!match) return null

  const open = color.indexOf("(")
  const close = color.lastIndexOf(")")
  if (open === -1 || close === -1) return null

  let body = color.slice(open + 1, close).trim()
  const slash = body.indexOf("/")
  if (slash !== -1) body = body.slice(0, slash).trim()

  const parts = body.includes(",")
    ? body.split(",").map((p) => p.trim())
    : body.split(/\s+/).filter(Boolean)
  if (parts.length < 3) return null

  const l = parseLabLightness(parts[0] ?? "")
  const a = parseCssNumber(parts[1] ?? "")
  const b = parseCssNumber(parts[2] ?? "")
  if (l === null || a === null || b === null) return null

  const linear = labToLinearSrgb(l, a, b)
  if (!linear) return null
  return linearSrgbToHex(linear)
}

function convertOklchString(color: string): string | null {
  const trimmed = color.trim()
  if (!/^oklch\(/i.test(trimmed)) return null

  const open = trimmed.indexOf("(")
  const close = trimmed.lastIndexOf(")")
  if (open === -1 || close === -1) return null

  let body = trimmed.slice(open + 1, close).trim()
  const slash = body.indexOf("/")
  if (slash !== -1) body = body.slice(0, slash).trim()

  const parts = body.includes(",")
    ? body.split(",").map((p) => p.trim())
    : body.split(/\s+/).filter(Boolean)
  if (parts.length < 3) return null

  const lRaw = parts[0]?.trim() ?? ""
  const isPercent = lRaw.endsWith("%")
  const lParsed = parseCssNumber(isPercent ? lRaw.slice(0, -1) : lRaw)
  const c = parseCssNumber(parts[1] ?? "")
  const h = parseCssNumber(parts[2] ?? "")
  if (lParsed === null || c === null || h === null) return null

  const l = isPercent ? lParsed / 100 : lParsed
  const linear = oklchToLinearSrgb(l, c, h)
  if (!linear) return null
  return linearSrgbToHex(linear)
}

function convertModernColorToHex(color: string): string | null {
  return convertLabString(color) ?? convertOklchString(color)
}

function tryCanvasNormalize(color: string): string {
  if (typeof document === "undefined") return ""
  const ctx = document.createElement("canvas").getContext("2d")
  if (!ctx) return ""
  try {
    ctx.fillStyle = color
    const normalized = ctx.fillStyle
    return isMapLibreSafe(normalized) ? normalized : ""
  } catch {
    return ""
  }
}

/**
 * MapLibre paint colors must be hex or rgb/rgba. `getComputedStyle` often
 * serializes themed tokens as `lab()` / `oklch()`; convert those with color
 * math instead of relying on canvas readback (which may preserve lab()).
 */
export function resolvePaintColor(
  color: string,
  fallbackToken?: ThemeColorToken
): string {
  const trimmed = color.trim()
  if (!trimmed) {
    return fallbackToken ? (THEME_PAINT_FALLBACKS[fallbackToken] ?? "") : ""
  }
  if (isMapLibreSafe(trimmed)) return trimmed

  const converted = convertModernColorToHex(trimmed)
  if (converted) return converted

  const fromCanvas = tryCanvasNormalize(trimmed)
  if (fromCanvas) return fromCanvas

  if (fallbackToken) {
    return THEME_PAINT_FALLBACKS[fallbackToken] ?? ""
  }
  return ""
}

/**
 * Resolved color for MapLibre paint properties and other canvas APIs that
 * cannot use `var(--token)` directly. Reads computed values from the document
 * root (or an optional element) so layers follow light/dark theme tokens.
 */
export function readThemeColor(
  token: ThemeColorToken,
  element?: HTMLElement
): string {
  if (typeof document === "undefined") {
    return THEME_PAINT_FALLBACKS[token] ?? ""
  }
  const host = element ?? document.documentElement
  const probe = document.createElement("span")
  probe.hidden = true
  probe.style.setProperty("color", `var(--${token})`)
  host.appendChild(probe)
  const resolved = getComputedStyle(probe).color.trim()
  probe.remove()
  return resolvePaintColor(resolved, token)
}
