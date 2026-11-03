import { z } from "zod";

export const organizationGetProfileInputSchema = z
  .object({})
  .strict()
  .default({});

export const organizationGetProfileOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  archivedAt: z.date().nullable(),
  description: z.string().nullable(),
  legalName: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  industry: z.string().nullable(),
  sizeBand: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  supportUrl: z.string().nullable(),
  countryCode: z.string().nullable(),
  region: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  canManageBranding: z.boolean(),
});

export type OrganizationGetProfileInput = z.infer<
  typeof organizationGetProfileInputSchema
>;
export type OrganizationGetProfileOutput = z.infer<
  typeof organizationGetProfileOutputSchema
>;
