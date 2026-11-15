import { z } from "zod"

import {
  fontMonoDefaults,
  fontRootDefaults,
  fontSansDefaults,
} from "../constants/font.constants"

const subsetSchema = z.enum(["latin"])

export const fontConfigSchema = z.object({
  sansVariable: z.string().default(fontSansDefaults.variable),
  monoVariable: z.string().default(fontMonoDefaults.variable),
  sansSubsets: z.array(subsetSchema).default([...fontSansDefaults.subsets]),
  monoSubsets: z.array(subsetSchema).default([...fontMonoDefaults.subsets]),
  bodyClassName: z.string().default(fontRootDefaults.bodyClassName),
})

export type FontConfig = z.infer<typeof fontConfigSchema>

export function loadFontConfig(overrides?: Partial<FontConfig>): FontConfig {
  return fontConfigSchema.parse(overrides ?? {})
}
