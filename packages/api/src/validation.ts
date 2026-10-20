import { type ZodTypeAny, z } from "zod/v3";

// Shared response helpers
export const makeResponseSchema = <T extends ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.literal("success"),
    message: z.string(),
    data: dataSchema,
    error: z.string().nullable().default(null),
  });

export const respond = <T>({
  data,
  message = "OK",
}: {
  data: T;
  message?: string;
}): { status: "success"; message: string; data: T; error: string | null } => ({
  status: "success",
  message,
  data,
  error: null,
});

const projectDescriptionSchema = z
  .string()
  .max(500, "Description must be 500 characters or fewer")
  .optional();

// Project schemas
export const createProjectInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or fewer"),
  description: projectDescriptionSchema,
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean().default(false),
});

export const updateProjectInput = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or fewer")
    .optional(),
  description: projectDescriptionSchema,
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
});

export const changeProjectStatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "inactive", "maintenance"]),
});

export const toggleProjectPublicInput = z.object({
  id: z.string().uuid(),
});

export const getProjectInput = z.object({
  id: z.string().uuid(),
});

export const getProjectBySlugInput = z.object({
  slug: z.string().min(1),
});

export const projectOutput = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isPublic: z.boolean(),
  repositoryUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  status: z.enum(["active", "inactive", "maintenance"]),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const environmentDisplayNameSchema = z
  .string()
  .trim()
  .min(1, "Environment name is required")
  .max(64, "Environment name must be 64 characters or fewer")
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/,
    "Use letters, numbers, spaces, hyphens, and underscores only. Name must start with a letter or number.",
  );

const entityIdSchema = z
  .string()
  .uuid("Invalid identifier. Refresh and try again.");

// Environment schemas
export const listEnvironmentsInput = z.object({
  projectId: entityIdSchema,
});

export const createEnvironmentInput = z.object({
  projectId: entityIdSchema,
  name: environmentDisplayNameSchema,
  slug: z.string().min(1).max(255).optional(),
  branch: z.string().optional(),
  deployedUrl: z.string().url().optional().or(z.literal("")),
  status: z
    .enum(["active", "inactive", "building", "failed"])
    .default("active"),
  isProduction: z.boolean().default(false),
  description: z.string().optional(),
});

export const updateEnvironmentInput = z.object({
  id: entityIdSchema,
  name: environmentDisplayNameSchema.optional(),
  slug: z.string().min(1).max(255).optional(),
  branch: z.string().optional(),
  deployedUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "building", "failed"]).optional(),
  isProduction: z.boolean().optional(),
  description: z.string().optional(),
});

export const getEnvironmentInput = z.object({
  id: entityIdSchema,
});

export const provenanceUserOutput = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
});

export const environmentOutput = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  branch: z.string().nullable(),
  deployedUrl: z.string().nullable(),
  status: z.enum(["active", "inactive", "building", "failed"]),
  isProduction: z.boolean(),
  description: z.string().nullable(),
  projectId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: provenanceUserOutput.nullable().optional(),
  updatedBy: provenanceUserOutput.nullable().optional(),
});

export const environmentVariableTypeSchema = z.enum(["secret", "config"]);

// Variable schemas
export const variableKeySchema = z
  .string()
  .trim()
  .min(1, "Key is required")
  .max(256, "Key must be 256 characters or fewer")
  .regex(
    /^[A-Za-z_][A-Za-z0-9_]*$/,
    "Keys must start with a letter or underscore and contain only letters, numbers, and underscores",
  );

export const createVariableInput = z.object({
  environmentId: entityIdSchema,
  key: variableKeySchema,
  value: z.string().max(100_000, "Value is too long"),
  type: environmentVariableTypeSchema.optional(),
  note: z
    .string()
    .max(2000, "Note must be 2000 characters or fewer")
    .optional(),
});

export const createVariablesBatchInput = z.object({
  environmentIds: z.array(entityIdSchema).min(1).max(64),
  variables: z
    .array(
      z.object({
        key: variableKeySchema,
        value: z.string().max(100_000, "Value is too long"),
        type: environmentVariableTypeSchema.default("secret"),
        note: z
          .string()
          .max(2000, "Note must be 2000 characters or fewer")
          .optional(),
      }),
    )
    .min(1)
    .max(25),
});

export const createVariablesBatchOutput = z.object({
  created: z.number(),
  skipped: z.number(),
});

export const updateVariableInput = z.object({
  id: entityIdSchema,
  key: variableKeySchema.optional(),
  value: z.string().max(100_000, "Value is too long").optional(),
  type: environmentVariableTypeSchema.optional(),
  note: z
    .string()
    .max(2000, "Note must be 2000 characters or fewer")
    .nullable()
    .optional(),
});

export const getVariableInput = z.object({
  id: entityIdSchema,
});

export const variableOutput = z.object({
  id: z.string(),
  key: z.string(),
  environmentId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: environmentVariableTypeSchema.optional(),
  note: z.string().nullable().optional(),
  value: z.string().optional(),
  createdBy: provenanceUserOutput.nullable().optional(),
  updatedBy: provenanceUserOutput.nullable().optional(),
});

export const variableWithDecryptedValueOutput = variableOutput.extend({
  value: z.string(),
});

export const environmentWithVariablesOutput = z.object({
  environment: environmentOutput.nullable(),
  variables: z.array(variableOutput),
});

// Bulk import schemas
export const bulkImportVariablesInput = z.object({
  environmentId: entityIdSchema,
  variables: z.array(
    z.object({
      key: z.string().min(1).max(256),
      value: z.string(),
    }),
  ),
  overwrite: z.boolean().default(false),
});

export const bulkImportResultOutput = z.object({
  created: z.number(),
  updated: z.number(),
  skipped: z.number(),
});

// Export schemas
export const exportVariablesInput = z.object({
  environmentId: entityIdSchema,
});

export const exportVariablesOutput = z.string();

// Audit log schemas
export const auditLogOutput = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string().nullable(),
  environmentId: z.string().nullable(),
  variableId: z.string().nullable(),
  action: z.string(),
  entityType: z.string(),
  entitySlug: z.string().nullable(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.date(),
});

export const listAuditLogsInput = z.object({
  projectId: z.string().uuid().optional(),
  environmentId: z.string().uuid().optional(),
  action: z
    .enum(["CREATE", "UPDATE", "DELETE", "BULK_IMPORT", "EXPORT"])
    .optional(),
  entityType: z.enum(["VARIABLE", "ENVIRONMENT", "PROJECT"]).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const notificationActorOutput = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
});

export const notificationListItemOutput = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  href: z.string().nullable(),
  icon: z.string(),
  actorUser: notificationActorOutput.nullable(),
});

export const accountConnectedOutput = z.object({
  id: z.string(),
  providerId: z.string(),
  accountId: z.string(),
  scope: z.string().nullable(),
  createdAt: z.string(),
});

export const accountDeleteBlockerOutput = z.object({
  canDelete: z.boolean(),
  soleOwnerOrganizations: z.array(
    z.object({
      organizationId: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
});

export const accountExportOutput = z.object({
  exportedAt: z.string(),
  note: z.string(),
  profile: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      emailVerified: z.boolean(),
      image: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .nullable(),
  connectedAccounts: z.array(
    z.object({
      providerId: z.string(),
      accountId: z.string(),
      scope: z.string().nullable(),
      createdAt: z.string(),
    }),
  ),
  sessions: z.array(
    z.object({
      id: z.string(),
      ipAddress: z.string().nullable(),
      userAgent: z.string().nullable(),
      createdAt: z.string(),
      expiresAt: z.string(),
    }),
  ),
  projects: z.array(z.record(z.unknown())),
  environments: z.array(z.record(z.unknown())),
  variables: z.array(z.record(z.unknown())),
  auditLog: z.array(z.record(z.unknown())),
});

// Template schemas
export const createTemplateInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  variables: z.array(
    z.object({
      key: z.string().min(1).max(256),
      value: z.string().optional().default(""),
      description: z.string().optional(),
    }),
  ),
});

export const getTemplateInput = z.object({
  id: z.string().uuid(),
});

export const listTemplatesOutput = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  variableCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const templateWithVariablesOutput = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  variables: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      value: z.string(),
      description: z.string().nullable(),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const applyTemplateInput = z.object({
  templateId: z.string().uuid(),
  environmentId: z.string().uuid(),
});
