import { auditEvent } from "@loftlancer/drizzle/schema/audit-event";
import { not, or, type SQL, sql } from "drizzle-orm";

/** Low-signal actions hidden from timeline by default (reads and timeline views). */
export function isPassiveAuditAction(action: string): boolean {
  if (action.endsWith(".read")) {
    return true;
  }
  return action.startsWith("audit.timeline.view.");
}

export function passiveActionSqlFilter(): SQL {
  const passive = or(
    sql`${auditEvent.action} like '%.read'`,
    sql`${auditEvent.action} like 'audit.timeline.view.%'`,
  );
  if (!passive) {
    throw new Error("passiveActionSqlFilter: expected non-empty OR clause");
  }
  return not(passive);
}
