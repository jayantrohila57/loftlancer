import { z } from "zod";

export const organizationGetBySlugInputSchema = z
  .object({ slug: z.string() })
  .strict();

export const organizationGetBySlugOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  role: z.string(),
  description: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  industry: z.string().nullable(),
  sizeBand: z.string().nullable(),
});

export type OrganizationGetBySlugInput = z.infer<
  typeof organizationGetBySlugInputSchema
>;
export type OrganizationGetBySlugOutput = z.infer<
  typeof organizationGetBySlugOutputSchema
>;
