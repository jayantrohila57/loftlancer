import { z } from "zod";

const teamMemberListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string(),
  role: z.enum(["lead", "member"]),
  createdAt: z.date(),
  addedByName: z.string().nullable(),
  updatedAt: z.date().nullable(),
  updatedByName: z.string().nullable(),
  name: z.string(),
  email: z.string(),
});

const projectListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const teamAvailableMemberOutputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
});

export const teamDeleteOutputSchema = z.object({
  success: z.boolean(),
  teamId: z.string(),
});

export const teamInvitationContextOutputSchema = z.object({
  memberEmails: z.array(z.string()),
  pendingEmails: z.array(z.string()),
});

export const teamInvitationCreateOutputSchema = z.object({
  id: z
    .string()
    .uuid()
    .transform(
      (id) => id as `${string}-${string}-${string}-${string}-${string}`,
    ),
  email: z.string(),
  role: z.string(),
  status: z.string(),
});

export const teamInvitationListOutputSchema = z.object({
  rows: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      status: z.string(),
      createdAt: z.string(),
      updatedAt: z.date(),
      lastSentAt: z.date().nullable(),
      acceptedAt: z.date().nullable(),
      rejectedAt: z.date().nullable(),
      revokedAt: z.date().nullable(),
      expiresAt: z.string(),
      inviterName: z.string().nullable(),
      invitedTeamRole: z.literal("member"),
      linkedProjects: z.array(z.string()),
    }),
  ),
  total: z.number().int().nonnegative(),
});

export const teamInvitationTargetOutputSchema = z.object({ id: z.string() });

export const teamLinkableProjectOutputSchema = projectListItemSchema;

export const teamMemberOutputSchema = z.object({
  teamId: z.string(),
  userId: z.string(),
});

export const teamMemberRoleOutputSchema = teamMemberOutputSchema.extend({
  role: z.enum(["lead", "member"]),
});

export const teamMemberListOutputSchema = teamMemberListItemSchema;

export const teamProjectLinkOutputSchema = z.object({
  ok: z.boolean(),
  id: z.string().optional(),
});

export const teamProjectOutputSchema = projectListItemSchema;

export const teamRestoreOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const teamUpdateOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  purpose: z.string().nullable(),
  updatedAt: z.date().nullable(),
  updatedBy: z.string(),
});
