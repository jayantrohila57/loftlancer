import { auditLog } from "@loftlancer/drizzle/schema/audit";
import { eq, type SQL } from "drizzle-orm";

export type AuditStatsScopeInput = {
  userId: string;
  projectId?: string;
};

/** Shared scope for audit.stats aggregate queries (user + optional project). */
export function buildAuditStatsWhereConditions(
  input: AuditStatsScopeInput,
): SQL[] {
  const whereConditions = [eq(auditLog.userId, input.userId)];

  if (input.projectId) {
    whereConditions.push(eq(auditLog.projectId, input.projectId));
  }

  return whereConditions;
}
