/** Decode a URL path or query segment for display (handles `%20`, `+`, etc.). */
export function decodePathSegment(segment: string | null | undefined): string {
  if (!segment) return ""

  const normalized = segment.replace(/\+/g, " ")

  try {
    return decodeURIComponent(normalized)
  } catch {
    return normalized
  }
}

/**
 * Words that stay lowercase inside a title. Capitalising every word turned
 * `report-and-analytics` into "Report And Analytics", which reads as a label
 * nobody wrote — the conjunction is not a heading word.
 */
const TITLE_MINOR_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "per",
  "the",
  "to",
  "up",
  "via",
  "vs",
  "with",
])

/**
 * Title-case a slug or a display label.
 *
 * Only the first letter is touched, so acronyms already in the input survive
 * ("PDF Export" stays "PDF Export"). The first and last words always capitalise,
 * however minor they are — "Items to Review" but "Reports to".
 */
export function slugToTitle(slug: string | null | undefined): string {
  const decoded = decodePathSegment(slug)
  if (!decoded) return ""

  const words = decoded
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")

  return words
    .map((word, index) => {
      const isEdge = index === 0 || index === words.length - 1
      if (!isEdge && TITLE_MINOR_WORDS.has(word.toLowerCase()))
        return word.toLowerCase()
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}
