import { z } from "zod";
export const teamCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Team name is required").max(100),
  description: z.string().trim().max(500).optional(),
  purpose: z.string().trim().max(250).optional(),
});
export type TeamCreateInput = z.infer<typeof teamCreateInputSchema>;
