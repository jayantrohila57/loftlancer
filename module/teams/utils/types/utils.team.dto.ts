import { z } from "zod";
export const teamDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  purpose: z.string().nullable(),
  organizationId: z.string(),
  createdAt: z.string(),
  createdByName: z.string().nullable(),
  updatedAt: z.string().nullable(),
  updatedByName: z.string().nullable(),
});
export type TeamDto = z.infer<typeof teamDtoSchema>;
