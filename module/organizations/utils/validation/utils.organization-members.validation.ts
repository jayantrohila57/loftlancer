import { z } from "zod";

export const organizationMembersInputSchema = z.object({}).strict().default({});
export const organizationMemberRemoveInputSchema = z
  .object({
    userId: z.string().min(1),
    reason: z.string().trim().max(250).optional(),
  })
  .strict();

const organizationMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  jobTitle: z.string().nullable(),
  department: z.string().nullable(),
  suspendedAt: z.date().nullable(),
  suspensionReason: z.string().nullable(),
  joinedAt: z.date().nullable(),
  invitedBy: z.string().nullable(),
  invitedByName: z.string().nullable(),
  invitedByEmail: z.string().nullable(),
  updatedAt: z.date().nullable(),
  updatedByName: z.string().nullable(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
  access: z.object({
    builtInRole: z.string(),
    customRole: z
      .object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        actions: z.array(z.string()),
      })
      .nullable(),
  }),
});

export const organizationMembersOutputSchema = z.object({
  items: z.array(organizationMemberSchema),
});
export const organizationMemberRemoveOutputSchema = z.object({
  success: z.boolean(),
  userId: z.string(),
});

export type OrganizationMembersInput = z.infer<
  typeof organizationMembersInputSchema
>;
export type OrganizationMemberRemoveInput = z.infer<
  typeof organizationMemberRemoveInputSchema
>;
export type OrganizationMembersOutput = z.infer<
  typeof organizationMembersOutputSchema
>;
export type OrganizationMemberRemoveOutput = z.infer<
  typeof organizationMemberRemoveOutputSchema
>;
