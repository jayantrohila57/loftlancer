import { themeModes } from "../constants/theme.constants"
import type { ThemeMode } from "../types/theme.types"

export function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === "string" &&
    (themeModes as readonly string[]).includes(value)
  )
}
