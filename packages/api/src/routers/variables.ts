import { decrypt, encrypt } from "@loftlancer/crypto";
import {
  activeEnvironmentVariableWhere,
  db,
  softDeleteEnvironmentVariableById,
} from "@loftlancer/db";
import {
  environment,
  environmentVariable,
  project,
} from "@loftlancer/db/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import {
  projectIdForEnvironmentInput,
  projectIdForVariableInput,
} from "../actions/guard-resolve";
import { createAuditLog, getProjectEnvironmentIds } from "../audit";
import {
  executeBulkVariableImport,
  planBulkVariableImport,
} from "../bulk-import-variables";
import {
  assertEnvironmentAccess,
  assertEnvironmentsAccess,
} from "../environment-access";
import { throwFriendlyError } from "../errors";
import { orgProcedure, router } from "../index";
import {
  bulkImportResultOutput,
  bulkImportVariablesInput,
  createVariableInput,
  createVariablesBatchInput,
  createVariablesBatchOutput,
  exportVariablesInput,
  exportVariablesOutput,
  getVariableInput,
  makeResponseSchema,
  respond,
  updateVariableInput,
  variableOutput,
  variableWithDecryptedValueOutput,
} from "../validation";
import {
  variableAuditKeyPayload,
  variableBulkImportAuditPayload,
} from "../variable-audit-payload";
import { formatVariableRows } from "../variable-format";
import { isVariablesV2Enabled } from "../variables-v2";

export const environmentVariablesRouter = router({
  // List variables for an environment (metadata only)
  list: orgProcedure
    .input(z.object({ environmentId: z.string().uuid() }))
    .use(
      actionGuard("variable.read", async (input) => {
        const partial = await projectIdForEnvironmentInput(input);
        if (!partial.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return partial;
      }),
    )
    .output(makeResponseSchema(z.array(variableOutput)))
    .query(async ({ ctx, input }) => {
      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          input.environmentId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Environment not found", data: [] });
      }

      const listWhere = activeEnvironmentVariableWhere(
        eq(environmentVariable.environmentId, input.environmentId),
      );

      const variables = isVariablesV2Enabled()
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
              type: environmentVariable.type,
              note: environmentVariable.note,
              encryptedValue: environmentVariable.encryptedValue,
              createdById: environmentVariable.createdBy,
              updatedById: environmentVariable.updatedBy,
            })
            .from(environmentVariable)
            .where(listWhere)
            .orderBy(environmentVariable.key)
        : await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
            })
            .from(environmentVariable)
            .where(listWhere)
            .orderBy(environmentVariable.key);

      const data = await formatVariableRows(variables);

      return respond({ message: "Variables fetched", data });
    }),

  countsByEnvironment: orgProcedure
    .input(
      z.object({
        environmentIds: z.array(z.string().uuid()).max(64),
      }),
    )
    .output(makeResponseSchema(z.record(z.string(), z.number())))
    .query(async ({ ctx, input }) => {
      if (input.environmentIds.length === 0) {
        return respond({ message: "Counts fetched", data: {} });
      }

      const allowedIds = await assertEnvironmentsAccess(
        ctx.session.user.id,
        input.environmentIds,
        ctx.activeOrganizationId,
      );
      if (allowedIds.length === 0) {
        return respond({ message: "Counts fetched", data: {} });
      }

      const rows = await db
        .select({
          environmentId: environmentVariable.environmentId,
          total: count(),
        })
        .from(environmentVariable)
        .where(
          activeEnvironmentVariableWhere(
            inArray(environmentVariable.environmentId, allowedIds),
          ),
        )
        .groupBy(environmentVariable.environmentId);

      const data: Record<string, number> = {};
      for (const id of allowedIds) {
        data[id] = 0;
      }
      for (const row of rows) {
        data[row.environmentId] = row.total;
      }

      return respond({ message: "Counts fetched", data });
    }),

  // Get a single variable with decrypted value
  get: orgProcedure
    .input(getVariableInput)
    .use(
      actionGuard("variable.reveal", async (input) => {
        const partial = await projectIdForVariableInput(input);
        if (!partial.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Variable not found",
          });
        }
        return partial;
      }),
    )
    .output(makeResponseSchema(variableWithDecryptedValueOutput.nullable()))
    .query(async ({ ctx, input }) => {
      const getWhere = eq(environmentVariable.id, input.id);

      const data = isVariablesV2Enabled()
        ? await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
              type: environmentVariable.type,
              note: environmentVariable.note,
              createdById: environmentVariable.createdBy,
              updatedById: environmentVariable.updatedBy,
            })
            .from(environmentVariable)
            .innerJoin(
              environment,
              eq(environmentVariable.environmentId, environment.id),
            )
            .innerJoin(project, eq(environment.projectId, project.id))
            .where(getWhere)
            .limit(1)
        : await db
            .select({
              id: environmentVariable.id,
              key: environmentVariable.key,
              encryptedValue: environmentVariable.encryptedValue,
              environmentId: environmentVariable.environmentId,
              createdAt: environmentVariable.createdAt,
              updatedAt: environmentVariable.updatedAt,
            })
            .from(environmentVariable)
            .innerJoin(
              environment,
              eq(environmentVariable.environmentId, environment.id),
            )
            .innerJoin(project, eq(environment.projectId, project.id))
            .where(getWhere)
            .limit(1);

      const record = data[0];
      if (!record) {
        return respond({ message: "Variable not found", data: null });
      }

      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          record.environmentId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Variable not found", data: null });
      }

      const formatRow = isVariablesV2Enabled()
        ? {
            id: record.id,
            key: record.key,
            environmentId: record.environmentId,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            type: (record as { type?: "secret" | "config" }).type,
            note: (record as { note?: string | null }).note,
            encryptedValue: record.encryptedValue,
            createdById: (record as { createdById?: string | null })
              .createdById,
            updatedById: (record as { updatedById?: string | null })
              .updatedById,
          }
        : {
            id: record.id,
            key: record.key,
            environmentId: record.environmentId,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          };

      const [formatted] = await formatVariableRows([formatRow]);
      if (!formatted) {
        return respond({ message: "Variable not found", data: null });
      }

      return respond({
        message: "Variable fetched",
        data: {
          ...formatted,
          value: decrypt(record.encryptedValue),
        },
      });
    }),

  // Create a new variable
  create: orgProcedure
    .input(createVariableInput)
    .use(
      actionGuard("variable.create", async (input) => {
        const partial = await projectIdForEnvironmentInput(input);
        if (!partial.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return partial;
      }),
    )
    .output(makeResponseSchema(variableOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          input.environmentId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Environment not found", data: null });
      }

      const normalizedKey = input.key.trim().toUpperCase();

      const duplicate = await db
        .select({ id: environmentVariable.id })
        .from(environmentVariable)
        .where(
          activeEnvironmentVariableWhere(
            and(
              eq(environmentVariable.environmentId, input.environmentId),
              eq(environmentVariable.key, normalizedKey),
            ),
          ),
        )
        .limit(1);

      if (duplicate.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Variable "${normalizedKey}" already exists in this environment.`,
        });
      }

      let newVariable: typeof environmentVariable.$inferSelect | undefined;
      try {
        [newVariable] = await db
          .insert(environmentVariable)
          .values({
            id: crypto.randomUUID(),
            key: normalizedKey,
            encryptedValue: encrypt(input.value),
            environmentId: input.environmentId,
            ...(isVariablesV2Enabled()
              ? {
                  type: input.type ?? "secret",
                  note: input.note?.trim() || null,
                  createdBy: ctx.session.user.id,
                  updatedBy: ctx.session.user.id,
                }
              : {}),
          })
          .returning();
      } catch (error) {
        throwFriendlyError(error, {
          fallback: "Unable to save this variable. Please try again.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      if (!newVariable) {
        return respond({ message: "Failed to create variable", data: null });
      }

      // Create audit log
      const envDetails = await getProjectEnvironmentIds(input.environmentId);
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          variableId: newVariable.id,
          action: "CREATE",
          entityType: "VARIABLE",
          newValue: JSON.stringify({
            key: normalizedKey,
          }),
        });
      }

      const [formatted] = await formatVariableRows([
        {
          id: newVariable.id,
          key: newVariable.key,
          environmentId: newVariable.environmentId,
          createdAt: newVariable.createdAt,
          updatedAt: newVariable.updatedAt,
          type: newVariable.type,
          note: newVariable.note,
          encryptedValue: newVariable.encryptedValue,
          createdById: newVariable.createdBy,
          updatedById: newVariable.updatedBy,
        },
      ]);

      if (!formatted) {
        return respond({ message: "Failed to create variable", data: null });
      }

      return respond({ message: "Variable created", data: formatted });
    }),

  createBatch: orgProcedure
    .input(createVariablesBatchInput)
    .output(makeResponseSchema(createVariablesBatchOutput))
    .mutation(async ({ ctx, input }) => {
      if (!isVariablesV2Enabled()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Variables v2 is not enabled.",
        });
      }

      const allowedIdList = await assertEnvironmentsAccess(
        ctx.session.user.id,
        input.environmentIds,
        ctx.activeOrganizationId,
      );
      const allowedIds = new Set(allowedIdList);
      if (allowedIds.size === 0) {
        return respond({
          message: "No accessible environments",
          data: { created: 0, skipped: 0 },
        });
      }

      let created = 0;
      let skipped = 0;

      for (const environmentId of input.environmentIds) {
        if (!allowedIds.has(environmentId)) {
          skipped += input.variables.length;
          continue;
        }

        for (const variable of input.variables) {
          const normalizedKey = variable.key.trim().toUpperCase();

          const duplicate = await db
            .select({ id: environmentVariable.id })
            .from(environmentVariable)
            .where(
              activeEnvironmentVariableWhere(
                and(
                  eq(environmentVariable.environmentId, environmentId),
                  eq(environmentVariable.key, normalizedKey),
                ),
              ),
            )
            .limit(1);

          if (duplicate.length > 0) {
            skipped++;
            continue;
          }

          const [newVariable] = await db
            .insert(environmentVariable)
            .values({
              id: crypto.randomUUID(),
              key: normalizedKey,
              encryptedValue: encrypt(variable.value),
              environmentId,
              type: variable.type ?? "secret",
              note: variable.note?.trim() || null,
              createdBy: ctx.session.user.id,
              updatedBy: ctx.session.user.id,
            })
            .returning();

          if (!newVariable) {
            skipped++;
            continue;
          }

          created++;

          const envDetails = await getProjectEnvironmentIds(environmentId);
          if (envDetails) {
            await createAuditLog({
              userId: ctx.session.user.id,
              projectId: envDetails.projectId,
              environmentId: envDetails.environmentId,
              variableId: newVariable.id,
              action: "CREATE",
              entityType: "VARIABLE",
              newValue: JSON.stringify({
                key: normalizedKey,
                type: variable.type ?? "secret",
              }),
            });
          }
        }
      }

      return respond({
        message: `Created ${created} variable${created === 1 ? "" : "s"}`,
        data: { created, skipped },
      });
    }),

  // Update a variable
  update: orgProcedure
    .input(updateVariableInput)
    .use(
      actionGuard("variable.update", async (input) => {
        const partial = await projectIdForVariableInput(input);
        if (!partial.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Variable not found",
          });
        }
        return partial;
      }),
    )
    .output(makeResponseSchema(variableOutput.nullable()))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          encryptedValue: environmentVariable.encryptedValue,
          environmentId: environmentVariable.environmentId,
        })
        .from(environmentVariable)
        .where(eq(environmentVariable.id, input.id))
        .limit(1);

      if (!existing.length) {
        return respond({ message: "Variable not found", data: null });
      }

      const existingVar = existing[0];
      if (!existingVar) {
        return respond({ message: "Variable not found", data: null });
      }

      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          existingVar.environmentId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Variable not found", data: null });
      }

      const normalizedKey = input.key?.trim().toUpperCase();

      if (normalizedKey && normalizedKey !== existingVar.key) {
        const duplicate = await db
          .select({ id: environmentVariable.id })
          .from(environmentVariable)
          .where(
            activeEnvironmentVariableWhere(
              and(
                eq(
                  environmentVariable.environmentId,
                  existingVar.environmentId,
                ),
                eq(environmentVariable.key, normalizedKey),
              ),
            ),
          )
          .limit(1);

        if (duplicate.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Variable "${normalizedKey}" already exists in this environment.`,
          });
        }
      }

      const updateData: {
        key?: string;
        encryptedValue?: string;
        type?: "secret" | "config";
        note?: string | null;
        updatedBy?: string;
      } = {};
      if (normalizedKey) updateData.key = normalizedKey;
      if (input.value !== undefined) {
        updateData.encryptedValue = encrypt(input.value);
      }
      if (isVariablesV2Enabled()) {
        if (input.type !== undefined) updateData.type = input.type;
        if (input.note !== undefined) {
          updateData.note = input.note?.trim() || null;
        }
        updateData.updatedBy = ctx.session.user.id;
      }

      const [updated] = await db
        .update(environmentVariable)
        .set(updateData)
        .where(eq(environmentVariable.id, input.id))
        .returning();

      if (!updated) {
        return respond({ message: "Failed to update variable", data: null });
      }

      // Create audit log
      const envDetails = await getProjectEnvironmentIds(
        existingVar.environmentId,
      );
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          variableId: input.id,
          action: "UPDATE",
          entityType: "VARIABLE",
          oldValue: variableAuditKeyPayload(existingVar.key),
          newValue: variableAuditKeyPayload(normalizedKey || existingVar.key),
        });
      }

      const [formatted] = await formatVariableRows([
        {
          id: updated.id,
          key: updated.key,
          environmentId: updated.environmentId,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          type: updated.type,
          note: updated.note,
          encryptedValue: updated.encryptedValue,
          createdById: updated.createdBy,
          updatedById: updated.updatedBy,
        },
      ]);

      if (!formatted) {
        return respond({ message: "Failed to update variable", data: null });
      }

      return respond({ message: "Variable updated", data: formatted });
    }),

  // Delete a variable
  delete: orgProcedure
    .input(getVariableInput)
    .use(
      actionGuard("variable.delete", async (input) => {
        const partial = await projectIdForVariableInput(input);
        if (!partial.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Variable not found",
          });
        }
        return partial;
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
          environmentId: environmentVariable.environmentId,
        })
        .from(environmentVariable)
        .where(eq(environmentVariable.id, input.id))
        .limit(1);

      if (!existing.length) {
        return { success: false };
      }

      const existingVar = existing[0];
      if (!existingVar) {
        return { success: false };
      }

      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          existingVar.environmentId,
          ctx.activeOrganizationId,
        );
      } catch {
        return { success: false };
      }

      // Create audit log before deletion
      const envDetails = await getProjectEnvironmentIds(
        existingVar.environmentId,
      );
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          variableId: input.id,
          action: "DELETE",
          entityType: "VARIABLE",
          oldValue: variableAuditKeyPayload(existingVar.key),
        });
      }

      await softDeleteEnvironmentVariableById(input.id, ctx.session.user.id);

      return { success: true };
    }),

  // Bulk import variables (supports .env file style imports)
  bulkImport: orgProcedure
    .input(bulkImportVariablesInput)
    .use(
      actionGuard("variable.bulk_import", async (input) => {
        const partial = await projectIdForEnvironmentInput(input);
        if (!partial.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return partial;
      }),
    )
    .output(makeResponseSchema(bulkImportResultOutput))
    .mutation(async ({ ctx, input }) => {
      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          input.environmentId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({
          message: "Environment not found",
          data: { created: 0, updated: 0, skipped: 0 },
        });
      }

      // Get existing variables for this environment
      const existingVars = await db
        .select({
          id: environmentVariable.id,
          key: environmentVariable.key,
        })
        .from(environmentVariable)
        .where(
          activeEnvironmentVariableWhere(
            eq(environmentVariable.environmentId, input.environmentId),
          ),
        );

      const existingKeyMap = new Map(existingVars.map((v) => [v.key, v.id]));

      const plan = planBulkVariableImport(
        input.variables,
        existingKeyMap,
        input.overwrite,
        encrypt,
      );

      await executeBulkVariableImport(input.environmentId, plan);

      const { created, updated, skipped } = plan;

      // Create audit log for bulk import
      const envDetails = await getProjectEnvironmentIds(input.environmentId);
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          action: "BULK_IMPORT",
          entityType: "VARIABLE",
          newValue: variableBulkImportAuditPayload({
            keys: input.variables.map((v) => v.key),
            overwrite: input.overwrite,
            result: { created, updated, skipped },
          }),
        });
      }

      return respond({
        message: `Imported ${created} new, updated ${updated}, skipped ${skipped} variables`,
        data: { created, updated, skipped },
      });
    }),

  // Export variables as .env format string
  export: orgProcedure
    .input(exportVariablesInput)
    .use(
      actionGuard("variable.export", async (input) => {
        const partial = await projectIdForEnvironmentInput(input);
        if (!partial.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found",
          });
        }
        return partial;
      }),
    )
    .output(makeResponseSchema(exportVariablesOutput))
    .query(async ({ ctx, input }) => {
      try {
        await assertEnvironmentAccess(
          ctx.session.user.id,
          input.environmentId,
          ctx.activeOrganizationId,
        );
      } catch {
        return respond({ message: "Environment not found", data: "" });
      }

      const variables = await db
        .select({
          key: environmentVariable.key,
          encryptedValue: environmentVariable.encryptedValue,
        })
        .from(environmentVariable)
        .where(
          activeEnvironmentVariableWhere(
            eq(environmentVariable.environmentId, input.environmentId),
          ),
        )
        .orderBy(environmentVariable.key);

      // Format as .env file (KEY=value with proper escaping)
      const envContent = variables
        .map((v) => {
          const decryptedValue = decrypt(v.encryptedValue);
          // Escape special characters and wrap in quotes if needed
          const needsQuotes =
            decryptedValue.includes(" ") ||
            decryptedValue.includes('"') ||
            decryptedValue.includes("'") ||
            decryptedValue.includes("\n") ||
            decryptedValue.includes("#");

          if (needsQuotes) {
            // Use double quotes and escape inner double quotes
            const escaped = decryptedValue
              .replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"')
              .replace(/\n/g, "\\n");
            return `${v.key}="${escaped}"`;
          }
          return `${v.key}=${decryptedValue}`;
        })
        .join("\n");

      // Create audit log for export
      const envDetails = await getProjectEnvironmentIds(input.environmentId);
      if (envDetails) {
        await createAuditLog({
          userId: ctx.session.user.id,
          projectId: envDetails.projectId,
          environmentId: envDetails.environmentId,
          action: "EXPORT",
          entityType: "VARIABLE",
          newValue: JSON.stringify({
            variablesCount: variables.length,
          }),
        });
      }

      return respond({
        message: `Exported ${variables.length} variables`,
        data: envContent,
      });
    }),
});
