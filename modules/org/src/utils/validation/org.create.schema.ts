import { z } from "zod"
import type { OrganizationSetupV2 } from "./org.setup.schema"
import { organizationSetupSchemaV2 } from "./org.setup.schema"

export const organizationSetupSchema = z.object({
  type: z.enum(["freelancer", "studio", "agency", "company"]),
  description: z.string().trim().max(500).optional(),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  timezone: z
    .string()
    .min(1)
    .max(64)
    .refine((zone) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: zone })
        return true
      } catch {
        return false
      }
    }),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
})

export type OrganizationSetup = z.infer<typeof organizationSetupSchema>

export const createOrganizationSchema = organizationSetupSchema.extend({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  logo: z.union([z.url(), z.literal("")]).optional(),
})

export const createOrganizationSchemaV2 = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  logo: z.union([z.url(), z.literal("")]).optional(),
  setup: organizationSetupSchemaV2,
})

export type CreateOrganizationV2 = z.infer<typeof createOrganizationSchemaV2>

export function parseOrganizationMetadataSetup(
  raw: unknown
): OrganizationSetup | OrganizationSetupV2 | null {
  if (!raw || typeof raw !== "object") return null
  const record = raw as Record<string, unknown>
  if (record.version === 2) {
    const parsed = organizationSetupSchemaV2.safeParse(record)
    return parsed.success ? parsed.data : null
  }
  const legacy = organizationSetupSchema.safeParse(record)
  return legacy.success ? legacy.data : null
}

export function validateCreateOrganizationInput(input: {
  name: string
  slug: string
  logo?: string | null
  setup: unknown
}) {
  const setup = parseOrganizationMetadataSetup(input.setup)
  if (!setup) return { success: false as const }
  if ("version" in setup && setup.version === 2) {
    return createOrganizationSchemaV2.safeParse({
      name: input.name,
      slug: input.slug,
      logo: input.logo ?? undefined,
      setup,
    })
  }
  return createOrganizationSchema.safeParse({
    name: input.name,
    slug: input.slug,
    logo: input.logo ?? undefined,
    ...setup,
  })
}
