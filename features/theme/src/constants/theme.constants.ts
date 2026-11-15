/** Default props aligned with https://ui.shadcn.com/docs/dark-mode/next */
export const themeProviderProps = {
  attribute: "class",
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: true,
} as const

export const themeModes = ["light", "dark", "system"] as const
