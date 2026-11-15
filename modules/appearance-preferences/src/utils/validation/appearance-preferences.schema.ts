import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"

const zoomLevels = ["70", "80", "90", "100", "110", "120", "130"] as const

export const appearancePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).nullable(),
  interfaceDensity: z.enum(["compact", "comfortable"]).nullable(),
  sidebarBehavior: z.enum(["expanded", "collapsed", "remember"]).nullable(),
  zoomLevel: z.enum(zoomLevels).nullable(),
})

export const appearanceZoomLevels = zoomLevels

export type AppearancePreferences = z.infer<typeof appearancePreferencesSchema>

const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? null : value), schema)

export const appearancePreferencesUpdateSchema = appearancePreferencesSchema
  .extend({
    theme: emptyToNull(appearancePreferencesSchema.shape.theme),
    interfaceDensity: emptyToNull(
      appearancePreferencesSchema.shape.interfaceDensity
    ),
    sidebarBehavior: emptyToNull(
      appearancePreferencesSchema.shape.sidebarBehavior
    ),
    zoomLevel: emptyToNull(appearancePreferencesSchema.shape.zoomLevel),
  })
  .partial()
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined))

export const appearancePreferencesResponseSchema = serviceResponseSchema(
  appearancePreferencesSchema
)
