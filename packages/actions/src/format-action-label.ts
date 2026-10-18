import { getActionDefinition } from "./registry";
import type { ActionName } from "./types";

/** Human-readable label for an audit action code (filter dropdowns and timeline). */
export function formatActionLabel(action: string): string {
  try {
    const def = getActionDefinition(action as ActionName);
    if (def.description?.trim()) {
      return def.description.trim();
    }
  } catch {
    // Unknown action — fall through to slug formatting.
  }
  return action
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" · ");
}
