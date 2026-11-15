import type { ThemeConfig } from "../config/theme.config"
import type { themeModes } from "../constants/theme.constants"

export type ThemeMode = (typeof themeModes)[number]

export type ThemeProviderConfig = ThemeConfig
