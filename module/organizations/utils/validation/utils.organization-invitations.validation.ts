import { z } from "zod";

export const invitationStatuses = [
  "all",
  "pending",
  "expired",
  "accepted",
  "rejected",
  "canceled",
] as const;

export const organizationInvitationListInputSchema = z
  .object({
    organizationId: z.string().min(1),
    teamId: z.string().min(1).optional(),
    status: z.enum(invitationStatuses).default("all"),
    search: z.string().trim().max(120).optional(),
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).default(0),
  })
  .strict();

export const organizationInvitationCreateInputSchema = z
  .object({
    organizationId: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["owner", "manager", "member"]).default("member"),
    teamId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
  })
  .strict();

export const organizationInvitationIdInputSchema = z
  .object({ invitationId: z.string().min(1) })
  .strict();

export const organizationInvitationPreviewInputSchema = z
  .object({ invitationId: z.string().min(1).max(200) })
  .strict();

export const organizationInvitationAcceptInputSchema = z
  .object({ invitationId: z.string().min(1) })
  .strict();

export const organizationInvitationListOutputSchema = z.object({
  rows: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      teamName: z.string().nullable(),
      status: z.string(),
      createdAt: z.date(),
      expiresAt: z.date(),
      inviterName: z.string().nullable(),
      invitedTeamRole: z.literal("member").nullable(),
      linkedProjects: z.array(z.string()),
    }),
  ),
  counts: z.object({
    all: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    expired: z.number().int().nonnegative(),
    accepted: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
    canceled: z.number().int().nonnegative(),
  }),
  total: z.number().int().nonnegative(),
});

export const organizationInvitationCreateOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
});
export const organizationInvitationMutationOutputSchema = z.object({
  success: z.boolean(),
});

const publicInvitationStatusSchema = z.enum([
  "pending",
  "expired",
  "accepted",
  "declined",
  "revoked",
  "unavailable",
  "not_found",
]);

export const organizationInvitationPreviewOutputSchema = z.union([
  z.object({ status: z.literal("not_found") }),
  z.object({
    status: publicInvitationStatusSchema,
    organizationName: z.string(),
    organizationSlug: z.string(),
    role: z.string(),
    inviterName: z.string().nullable(),
    projectId: z.string().nullable(),
    projectName: z.string().nullable(),
    projectSlug: z.string().nullable(),
    teamId: z.string().nullable(),
    teamName: z.string().nullable(),
    invitedTeamRole: z.literal("member").nullable(),
    linkedProjects: z.array(z.object({ name: z.string(), slug: z.string() })),
  }),
]);

export const organizationInvitationAcceptOutputSchema = z.object({
  memberId: z.string(),
  organizationId: z.string(),
  invitationId: z.string(),
  status: z.literal("accepted"),
});

export type OrganizationInvitationListInput = z.infer<
  typeof organizationInvitationListInputSchema
>;
export type OrganizationInvitationCreateInput = z.infer<
  typeof organizationInvitationCreateInputSchema
>;
export type OrganizationInvitationIdInput = z.infer<
  typeof organizationInvitationIdInputSchema
>;
export type OrganizationInvitationPreviewInput = z.infer<
  typeof organizationInvitationPreviewInputSchema
>;
export type OrganizationInvitationAcceptInput = z.infer<
  typeof organizationInvitationAcceptInputSchema
>;
export type OrganizationInvitationListOutput = z.infer<
  typeof organizationInvitationListOutputSchema
>;
export type OrganizationInvitationCreateOutput = z.infer<
  typeof organizationInvitationCreateOutputSchema
>;
export type OrganizationInvitationPreviewOutput = z.infer<
  typeof organizationInvitationPreviewOutputSchema
>;
export type OrganizationInvitationAcceptOutput = z.infer<
  typeof organizationInvitationAcceptOutputSchema
>;
