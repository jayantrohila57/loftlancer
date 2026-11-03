import { z } from "zod";

export const organizationListInputSchema = z.object({}).strict().default({});

export const organizationListOutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      logo: z.string().nullable(),
      role: z.string(),
      createdAt: z.date(),
      archivedAt: z.date().nullable(),
    }),
  ),
});

export type OrganizationListInput = z.infer<typeof organizationListInputSchema>;
export type OrganizationListOutput = z.infer<
  typeof organizationListOutputSchema
>;
