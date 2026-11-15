import { z } from "zod"

import { themeModes, themeProviderProps } from "../constants/theme.constants"

export const themeConfigSchema = z.object({
  attribute: z.literal("class").default(themeProviderProps.attribute),
  defaultTheme: z.enum(themeModes).default(themeProviderProps.defaultTheme),
  enableSystem: z.boolean().default(themeProviderProps.enableSystem),
  disableTransitionOnChange: z
    .boolean()
    .default(themeProviderProps.disableTransitionOnChange),
})

export type ThemeConfig = z.infer<typeof themeConfigSchema>

export function loadThemeConfig(overrides?: Partial<ThemeConfig>): ThemeConfig {
  return themeConfigSchema.parse({
    ...themeProviderProps,
    ...overrides,
  })
}
