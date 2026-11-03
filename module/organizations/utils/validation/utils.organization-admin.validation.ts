import { z } from "zod";

const emptyInput = z.object({}).strict();
const successOutput = z.object({ success: z.literal(true) });

export const organizationSettingsInputSchema = emptyInput;
export const organizationSettingsPatchSchema = z
  .object({
    timeZone: z
      .string()
      .min(1)
      .max(100)
      .refine((zone) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: zone });
          return true;
        } catch {
          return false;
        }
      }, "Choose a valid time zone."),
    locale: z
      .string()
      .min(2)
      .max(35)
      .refine((locale) => {
        try {
          return Intl.getCanonicalLocales(locale).length === 1;
        } catch {
          return false;
        }
      }, "Choose a valid locale."),
    dateFormat: z.enum(["short", "medium", "long"]),
    timeFormat: z.enum(["12h", "24h"]),
    weekStart: z.number().int().min(0).max(6),
    displayCurrency: z.string().regex(/^[A-Z]{3}$/),
    defaultProjectVisibility: z.enum(["private", "public"]),
    notificationDefaults: z
      .object({
        email: z.boolean(),
        inApp: z.boolean(),
        version: z.literal(1),
      })
      .strict(),
  })
  .strict();
export const organizationSettingsOutputSchema =
  organizationSettingsPatchSchema.extend({ canEdit: z.boolean() });
export const organizationProfilePatchSchema = z
  .object({
    description: z.string().trim().min(1).max(2000).nullable().optional(),
    legalName: z.string().trim().min(1).max(200).nullable().optional(),
    websiteUrl: z
      .string()
      .url()
      .max(2048)
      .refine((value) => ["http:", "https:"].includes(new URL(value).protocol))
      .nullable()
      .optional(),
    industry: z.string().trim().min(1).max(120).nullable().optional(),
    sizeBand: z
      .enum(["1-10", "11-50", "51-200", "201-1000", "1001+"])
      .nullable()
      .optional(),
    foundedYear: z
      .number()
      .int()
      .min(1000)
      .max(new Date().getFullYear())
      .nullable()
      .optional(),
    contactEmail: z.string().trim().email().max(320).nullable().optional(),
    contactPhone: z.string().trim().min(1).max(64).nullable().optional(),
    supportUrl: z
      .string()
      .url()
      .max(2048)
      .refine((value) => ["http:", "https:"].includes(new URL(value).protocol))
      .nullable()
      .optional(),
    countryCode: z
      .string()
      .regex(/^[A-Za-z]{2}$/)
      .nullable()
      .optional(),
    region: z.string().trim().min(1).max(120).nullable().optional(),
    city: z.string().trim().min(1).max(120).nullable().optional(),
    postalCode: z.string().trim().min(1).max(32).nullable().optional(),
    addressLine1: z.string().trim().min(1).max(200).nullable().optional(),
    addressLine2: z.string().trim().min(1).max(200).nullable().optional(),
  })
  .strict()
  .refine(
    (input) => Object.keys(input).length > 0,
    "Provide at least one profile field.",
  );
export const organizationLogoInputSchema = z
  .object({
    logo: z
      .string()
      .url()
      .max(2048)
      .refine(
        (value) => new URL(value).protocol === "https:",
        "Logo URL must use HTTPS.",
      )
      .nullable(),
  })
  .strict();
export const organizationSettingsMutationOutputSchema = successOutput;

const roleActionsSchema = z.array(z.string()).max(40);
export const organizationRoleListInputSchema = emptyInput;
export const organizationRoleListOutputSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.date(),
    actions: z.array(z.string()),
    memberIds: z.array(z.string()),
  }),
);
export const organizationRoleCreateInputSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    description: z.string().trim().max(240).optional(),
    actions: roleActionsSchema,
  })
  .strict();
export const organizationRoleUpdateInputSchema =
  organizationRoleCreateInputSchema
    .extend({ roleId: z.string().min(1) })
    .strict();
export const organizationRoleIdInputSchema = z
  .object({ roleId: z.string().min(1) })
  .strict();
export const organizationRoleAssignInputSchema = z
  .object({ memberId: z.string().min(1), roleId: z.string().min(1).nullable() })
  .strict();
export const organizationRoleCreateOutputSchema = z.object({ id: z.string() });
export const organizationRoleMutationOutputSchema = successOutput;

export const organizationSecurityDomainListInputSchema = emptyInput;
export const organizationSecurityDomainListOutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      hostname: z.string(),
      purpose: z.string(),
      state: z.string(),
      challengeExpiresAt: z.date(),
      verifiedAt: z.date().nullable(),
      createdAt: z.date(),
    }),
  ),
});
export const organizationSecurityDomainCreateInputSchema = z
  .object({ hostname: z.string().min(1).max(253) })
  .strict();
export const organizationSecurityDomainIdInputSchema = z
  .object({ domainId: z.string().uuid() })
  .strict();
export const organizationSecurityDomainCreateOutputSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  state: z.literal("pending"),
  txtRecord: z.object({ name: z.string(), value: z.string() }),
  expiresAt: z.date(),
});
export const organizationSecurityDomainVerifyOutputSchema = z.object({
  verified: z.boolean(),
  message: z.string(),
});
export const organizationSecurityDomainMutationOutputSchema = successOutput;

export const organizationLifecycleInputSchema = emptyInput;
export const organizationLifecycleOutputSchema = successOutput;
export const organizationTransferOwnershipInputSchema = z
  .object({ targetUserId: z.string().min(1) })
  .strict();
export const organizationTransferOwnershipOutputSchema = z.object({
  organizationId: z.string(),
  newOwnerUserId: z.string(),
});

export const organizationMemberProfileInputSchema = z
  .object({
    memberId: z.string().min(1),
    jobTitle: z.string().trim().max(100).nullable(),
    department: z.string().trim().max(100).nullable(),
  })
  .strict();
export const organizationMemberSuspendInputSchema = z
  .object({
    memberId: z.string().min(1),
    suspended: z.boolean(),
    reason: z.string().trim().max(250).optional(),
  })
  .strict();
export const organizationMemberIdInputSchema = z
  .object({ memberId: z.string().min(1) })
  .strict();
export const organizationMemberAdminOutputSchema = successOutput;
export const organizationMemberAccessSummaryOutputSchema = z.object({
  member: z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string().nullable(),
    suspended: z.boolean(),
    suspensionReason: z.string().nullable(),
    customRole: z.string().nullable(),
    organizationActions: z.array(z.string()),
  }),
  teams: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      purpose: z.string().nullable(),
      role: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      sources: z.array(z.string()),
      permissions: z.array(z.string()),
    }),
  ),
  apps: z.array(
    z.object({
      id: z.string(),
      projectId: z.string(),
      projectName: z.string(),
      projectSlug: z.string(),
      name: z.string(),
      sources: z.array(z.string()),
    }),
  ),
  activity: z
    .array(
      z.object({
        id: z.string(),
        action: z.string(),
        result: z.string(),
        entityType: z.string(),
        createdAt: z.date(),
      }),
    )
    .nullable(),
});

export type OrganizationSettingsPatch = z.infer<
  typeof organizationSettingsPatchSchema
>;
export type OrganizationSettingsOutput = z.infer<
  typeof organizationSettingsOutputSchema
>;
export type OrganizationProfilePatch = z.infer<
  typeof organizationProfilePatchSchema
>;
export type OrganizationSecurityDomainListOutput = z.infer<
  typeof organizationSecurityDomainListOutputSchema
>;
export type OrganizationMemberAccessSummaryOutput = z.infer<
  typeof organizationMemberAccessSummaryOutputSchema
>;
export type OrganizationRoleCreateInput = z.infer<
  typeof organizationRoleCreateInputSchema
>;
export type OrganizationRoleUpdateInput = z.infer<
  typeof organizationRoleUpdateInputSchema
>;
export type OrganizationMemberProfileInput = z.infer<
  typeof organizationMemberProfileInputSchema
>;
export type OrganizationMemberSuspendInput = z.infer<
  typeof organizationMemberSuspendInputSchema
>;
