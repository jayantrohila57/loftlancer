/** Default clamp line count for in-app page header descriptions. */
export const PAGE_HEADER_DESCRIPTION_LINES = 2;

/**
 * True when `el` has more content than `lines` of text at the current width
 * (line-clamp measurement).
 */
export function measureLineClampTruncated(el: HTMLElement, lines: number) {
  const style = getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight);
  if (Number.isFinite(lineHeight) && lineHeight > 0 && lines > 0) {
    return el.scrollHeight > lineHeight * lines + 1;
  }
  return el.scrollHeight > el.clientHeight + 1;
}
