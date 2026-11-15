/** Skip global shell shortcuts while the user is typing in a field. */
export function shouldIgnoreGlobalKeyboardShortcut(
  event: KeyboardEvent
): boolean {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}
