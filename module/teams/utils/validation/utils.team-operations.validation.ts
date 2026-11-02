import { z } from "zod";
import { teamGetInputSchema } from "./utils.team-id.validation";
export const teamUpdateInputSchema = teamGetInputSchema.extend({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  purpose: z.string().trim().max(250).nullable().optional(),
});
export const teamMemberInputSchema = teamGetInputSchema.extend({
  userId: z.string().min(1),
});
export const teamMemberRoleInputSchema = teamMemberInputSchema.extend({
  role: z.enum(["lead", "member"]),
});
