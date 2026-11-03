import { z } from "zod/v3";

const organizationRefFields = z.object({
  organizationId: z.string().min(1).optional(),
  organizationSlug: z.string().min(1).optional(),
});

/** Organization scope for MCP tools (Bearer tokens have no active-org cookie). */
export const organizationRefSchema = organizationRefFields.refine(
  (value) => Boolean(value.organizationId ?? value.organizationSlug),
  "organizationId or organizationSlug is required",
);

export const optionalOrganizationRefSchema = organizationRefFields;

export const organizationRefFieldsSchema = organizationRefFields;

export type OrganizationRef = z.infer<typeof organizationRefSchema>;
