import { z } from "zod";
import { teamGetInputSchema } from "./utils.team-id.validation";
export const teamProjectLinkInputSchema = teamGetInputSchema.extend({
  projectId: z.string().min(1),
});
export const invitationStatuses = [
  "all",
  "pending",
  "expired",
  "accepted",
  "rejected",
  "canceled",
] as const;
export const teamInvitationListInputSchema = teamGetInputSchema.extend({
  status: z.enum(invitationStatuses).default("pending"),
  search: z.string().trim().max(120).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});
export const teamInvitationCreateInputSchema = teamGetInputSchema.extend({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  role: z.enum(["member", "manager", "owner"]).default("member"),
});
export const teamInvitationTargetInputSchema = teamGetInputSchema.extend({
  invitationId: z.string().min(1),
});
export type TeamInvitationListInput = z.infer<
  typeof teamInvitationListInputSchema
>;
export type TeamInvitationCreateInput = z.infer<
  typeof teamInvitationCreateInputSchema
>;
export type TeamInvitationTargetInput = z.infer<
  typeof teamInvitationTargetInputSchema
>;
export type TeamProjectLinkInput = z.infer<typeof teamProjectLinkInputSchema>;
