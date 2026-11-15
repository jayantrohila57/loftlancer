/** Applies saved account zoom using the same mechanism as browser page zoom (`zoom` on `html`). */
export function applyAccountZoom(level: string | null): void {
  if (typeof document === "undefined") return

  const value = level ?? "100"
  const percent = Number(value)
  const scale = Number.isFinite(percent) && percent > 0 ? percent / 100 : 1

  document.documentElement.style.setProperty("--account-zoom", `${value}%`)
  document.documentElement.setAttribute("data-zoom-level", value)

  if (scale === 1) {
    document.documentElement.style.removeProperty("zoom")
  } else {
    document.documentElement.style.zoom = String(scale)
  }
}
