import {
  activeEnvironmentVariableWhere,
  activeEnvironmentWhere,
  db,
} from "@loftlancer/drizzle";
import { auditLog } from "@loftlancer/drizzle/schema/audit";
import {
  environment,
  environmentVariable,
} from "@loftlancer/drizzle/schema/projects";
import { logger } from "@loftlancer/sentry";
import { eq } from "drizzle-orm";

export interface AuditLogData {
  userId: string;
  projectId?: string | null;
  environmentId?: string | null;
  variableId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "BULK_IMPORT" | "EXPORT";
  entityType: "VARIABLE" | "ENVIRONMENT" | "PROJECT";
  entitySlug?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await db.insert(auditLog).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      projectId: data.projectId || null,
      environmentId: data.environmentId || null,
      variableId: data.variableId || null,
      action: data.action,
      entityType: data.entityType,
      entitySlug: data.entitySlug || null,
      oldValue: data.oldValue || null,
      newValue: data.newValue || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      metadata: data.metadata || null,
    });
  } catch (error) {
    logger.exception("audit log write failed", error);
    // Don't throw error to avoid breaking main operations
  }
}

export async function getProjectEnvironmentIds(
  environmentId: string,
): Promise<{ projectId: string | null; environmentId: string } | null> {
  try {
    const result = await db.query.environment.findFirst({
      where: activeEnvironmentWhere(eq(environment.id, environmentId)),
      columns: {
        id: true,
        projectId: true,
      },
    });

    return result
      ? { projectId: result.projectId, environmentId: result.id }
      : null;
  } catch (error) {
    logger.error("audit environment lookup failed", error);
    return null;
  }
}

export async function getVariableDetails(variableId: string) {
  try {
    const result = await db.query.environmentVariable.findFirst({
      where: activeEnvironmentVariableWhere(
        eq(environmentVariable.id, variableId),
      ),
      columns: {
        id: true,
        key: true,
        environmentId: true,
      },
      with: {
        environment: {
          columns: {
            id: true,
            projectId: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    logger.error("audit variable lookup failed", error);
    return null;
  }
}
