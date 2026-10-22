import { z } from "zod/v3";

// Project types
export const createProjectInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  purpose: z.string().max(500).optional(),
  documentationUrl: z.string().url().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  repositoryUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  isPublic: z.boolean().default(false),
});

export const updateProjectInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  purpose: z.string().max(500).nullable().optional(),
  documentationUrl: z.string().url().nullable().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
  repositoryUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

export const getProjectInput = z.object({
  id: z.string(),
});

// Environment types
export const createEnvironmentInput = z.object({
  projectId: z.string(),
  name: z.string().min(1).max(50),
});

export const updateEnvironmentInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
});

export const getEnvironmentInput = z.object({
  id: z.string(),
});

export const listEnvironmentsInput = z.object({
  projectId: z.string(),
});

// Variable types
export const createVariableInput = z.object({
  environmentId: z.string(),
  key: z.string().min(1).max(100),
  value: z.string(),
});

export const updateVariableInput = z.object({
  id: z.string(),
  key: z.string().min(1).max(100).optional(),
  value: z.string().optional(),
});

export const getVariableInput = z.object({
  id: z.string(),
});

export const listVariablesInput = z.object({
  environmentId: z.string(),
});

export const bulkImportInput = z.object({
  environmentId: z.string(),
  variables: z.array(
    z.object({
      key: z.string().min(1).max(100),
      value: z.string(),
    }),
  ),
});

export const exportVariablesInput = z.object({
  environmentId: z.string(),
});

export const searchVariablesInput = z.object({
  query: z.string().min(1),
  projectId: z.string().optional(),
});

// Output types
export const projectOutput = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  purpose: z.string().nullable(),
  documentationUrl: z.string().nullable(),
  startDate: z.string().nullable(),
  targetDate: z.string().nullable(),
  updatedBy: z.string().nullable(),
  status: z.enum(["active", "inactive", "maintenance"]),
  isArchived: z.boolean(),
  isPublic: z.boolean(),
  repositoryUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
});

export const variableOutput = z.object({
  id: z.string(),
  key: z.string(),
  environmentId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const variableWithValueOutput = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
});

export const searchVariableOutput = z.object({
  id: z.string(),
  key: z.string(),
  environmentId: z.string(),
  environmentName: z.string(),
  projectName: z.string(),
  projectId: z.string(),
});

export const exportOutput = z.object({
  content: z.string(),
  filename: z.string(),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectInput>;
export type UpdateProjectInput = z.infer<typeof updateProjectInput>;
export type GetProjectInput = z.infer<typeof getProjectInput>;

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentInput>;
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentInput>;
export type GetEnvironmentInput = z.infer<typeof getEnvironmentInput>;
export type ListEnvironmentsInput = z.infer<typeof listEnvironmentsInput>;

export type CreateVariableInput = z.infer<typeof createVariableInput>;
export type UpdateVariableInput = z.infer<typeof updateVariableInput>;
export type GetVariableInput = z.infer<typeof getVariableInput>;
export type ListVariablesInput = z.infer<typeof listVariablesInput>;
export type BulkImportInput = z.infer<typeof bulkImportInput>;
export type ExportVariablesInput = z.infer<typeof exportVariablesInput>;
export type SearchVariablesInput = z.infer<typeof searchVariablesInput>;

export type ProjectOutput = z.infer<typeof projectOutput>;
export type EnvironmentOutput = z.infer<typeof environmentOutput>;
export type VariableOutput = z.infer<typeof variableOutput>;
export type VariableWithValueOutput = z.infer<typeof variableWithValueOutput>;
export type SearchVariableOutput = z.infer<typeof searchVariableOutput>;
export type ExportOutput = z.infer<typeof exportOutput>;
