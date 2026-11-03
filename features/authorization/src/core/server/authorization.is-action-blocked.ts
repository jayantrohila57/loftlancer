import type { ActionName } from "@features/authorization/utils";
import { db } from "@loftlancer/drizzle";
import { actionBlock } from "@loftlancer/drizzle/schema/action-block";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";

type BlockScope = {
  userId: string;
  organizationId?: string | null;
  projectId?: string | null;
};

function scopeMatchCondition(scope: BlockScope) {
  return or(
    and(
      eq(actionBlock.scopeType, "user"),
      eq(actionBlock.scopeId, scope.userId),
    ),
    scope.organizationId
      ? and(
          eq(actionBlock.scopeType, "organization"),
          eq(actionBlock.scopeId, scope.organizationId),
        )
      : sql`false`,
    scope.projectId
      ? and(
          eq(actionBlock.scopeType, "project"),
          eq(actionBlock.scopeId, scope.projectId),
        )
      : sql`false`,
  );
}

/** Load active blocks for a scope once (permissions snapshot hot path). */
export async function loadBlockedActionsForScope(
  scope: BlockScope,
): Promise<Set<string>> {
  const now = new Date();
  const rows = await db
    .select({ action: actionBlock.action })
    .from(actionBlock)
    .where(
      and(
        or(isNull(actionBlock.expiresAt), gt(actionBlock.expiresAt, now)),
        scopeMatchCondition(scope),
      ),
    );
  return new Set(rows.map((row) => row.action));
}

export function isActionBlockedInSet(
  action: ActionName,
  blocked: Set<string>,
): boolean {
  return blocked.has(action) || blocked.has("*");
}

export async function isActionBlocked(
  action: ActionName,
  scope: BlockScope,
): Promise<boolean> {
  const now = new Date();
  const rows = await db
    .select({ id: actionBlock.id })
    .from(actionBlock)
    .where(
      and(
        or(eq(actionBlock.action, action), eq(actionBlock.action, "*")),
        or(isNull(actionBlock.expiresAt), gt(actionBlock.expiresAt, now)),
        scopeMatchCondition(scope),
      ),
    )
    .limit(1);

  return rows.length > 0;
}
