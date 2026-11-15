import { serviceResponseSchema } from "@packages/orpc"
import { z } from "zod"
import {
  currencyCodes,
  regionCodes,
} from "../constants/regional-preferences.iso"

const timeZone = z
  .string()
  .max(100)
  .refine((value) => {
    if (!/^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/.test(value))
      return false
    try {
      new Intl.DateTimeFormat("en", { timeZone: value })
      return true
    } catch {
      return false
    }
  })

export const regionalPreferencesSchema = z.object({
  language: z.enum(["en-us", "en-in", "es-es"]).nullable(),
  region: z
    .string()
    .refine((value) => regionCodes.has(value))
    .nullable(),
  timeZone: timeZone.nullable(),
  dateStyle: z.enum(["short", "medium", "long"]).nullable(),
  hourCycle: z.enum(["h12", "h23"]).nullable(),
  currency: z
    .string()
    .refine((value) => currencyCodes.has(value))
    .nullable(),
  numberGrouping: z.enum(["auto", "never"]).nullable(),
  measurementSystem: z.enum(["metric", "us", "uk"]).nullable(),
})

export type RegionalPreferences = z.infer<typeof regionalPreferencesSchema>

export const regionalPreferencesUpdateSchema = regionalPreferencesSchema
  .partial()
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined))

export const regionalPreferencesResponseSchema = serviceResponseSchema(
  regionalPreferencesSchema
)
