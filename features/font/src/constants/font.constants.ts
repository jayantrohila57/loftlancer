/** CSS variables consumed by `@packages/ui` / Coss theme (`--font-sans`, `--font-mono`; `--font-heading` aliases sans in globals.css). */
export const fontSansDefaults = {
  subsets: ["latin"] as const,
  variable: "--font-sans",
} as const

export const fontMonoDefaults = {
  subsets: ["latin"] as const,
  variable: "--font-mono",
} as const

export const fontRootDefaults = {
  bodyClassName: "font-sans",
  htmlExtras: ["antialiased"] as const,
} as const
