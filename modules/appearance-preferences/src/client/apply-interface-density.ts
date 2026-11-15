/** Applies saved interface density on `document.documentElement`. */
export function applyInterfaceDensity(
  density: "compact" | "comfortable" | null
): void {
  if (typeof document === "undefined") return
  if (density === null) {
    document.documentElement.removeAttribute("data-interface-density")
    return
  }
  document.documentElement.setAttribute("data-interface-density", density)
}
