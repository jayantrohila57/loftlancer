import { z } from "zod/v3";

export const organizationSettingsPatchSchema = z.object({
  timeZone: z
    .string()
    .min(1)
    .max(100)
    .refine((zone) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: zone });
        return true;
      } catch {
        return false;
      }
    }, "Choose a valid time zone."),
  locale: z
    .string()
    .min(2)
    .max(35)
    .refine((locale) => {
      try {
        return Intl.getCanonicalLocales(locale).length === 1;
      } catch {
        return false;
      }
    }, "Choose a valid locale."),
  dateFormat: z.enum(["short", "medium", "long"]),
  timeFormat: z.enum(["12h", "24h"]),
  weekStart: z.number().int().min(0).max(6),
  displayCurrency: z.string().regex(/^[A-Z]{3}$/),
  defaultProjectVisibility: z.enum(["private", "public"]),
  notificationDefaults: z
    .object({
      email: z.boolean(),
      inApp: z.boolean(),
      version: z.literal(1),
    })
    .strict(),
});
