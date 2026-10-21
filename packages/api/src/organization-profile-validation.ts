import { z } from "zod/v3";

export const safeHttpUrlSchema = z
  .string()
  .url()
  .max(2048)
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol));

const nonEmptyText = (max: number) => z.string().trim().min(1).max(max);

export const organizationProfileFieldsSchema = z
  .object({
    description: nonEmptyText(2000).nullable().optional(),
    legalName: nonEmptyText(200).nullable().optional(),
    websiteUrl: safeHttpUrlSchema.nullable().optional(),
    industry: nonEmptyText(120).nullable().optional(),
    sizeBand: z
      .enum(["1-10", "11-50", "51-200", "201-1000", "1001+"])
      .nullable()
      .optional(),
    foundedYear: z
      .number()
      .int()
      .min(1000)
      .max(new Date().getFullYear())
      .nullable()
      .optional(),
    contactEmail: z.string().trim().email().max(320).nullable().optional(),
    contactPhone: nonEmptyText(64).nullable().optional(),
    supportUrl: safeHttpUrlSchema.nullable().optional(),
    countryCode: z
      .string()
      .regex(/^[A-Za-z]{2}$/)
      .nullable()
      .optional(),
    region: nonEmptyText(120).nullable().optional(),
    city: nonEmptyText(120).nullable().optional(),
    postalCode: nonEmptyText(32).nullable().optional(),
    addressLine1: nonEmptyText(200).nullable().optional(),
    addressLine2: nonEmptyText(200).nullable().optional(),
  })
  .strict();

export const organizationProfilePatchSchema =
  organizationProfileFieldsSchema.refine(
    (patch) => Object.keys(patch).length > 0,
    "Provide at least one profile field.",
  );
