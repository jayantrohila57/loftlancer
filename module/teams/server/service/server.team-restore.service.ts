import { db } from "@loftlancer/drizzle";
import { team } from "@loftlancer/drizzle/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/t3-env/soft-deletes";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import type { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamOutcome } from "./server.team-outcome.service";

async function perform(
  _userId: string,
  organizationId: string,
  teamId: string,
) {
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const [row] = await db
    .update(team)
    .set({ deletedAt: null, deletedBy: null })
    .where(and(eq(team.id, teamId), eq(team.organizationId, organizationId)))
    .returning({ id: team.id, name: team.name });
  if (!row) {
    throw new Error("team_not_found");
  }
  return row;
}

export function teamRestoreService(
  ctx: RunActionContext,
  input: z.infer<typeof teamGetInputSchema>,
) {
  if (!ctx.orgId)
    return Promise.resolve({
      kind: "failed" as const,
      message: "Select an organization to continue.",
    });
  const organizationId = ctx.orgId;
  return teamOutcome(
    () => perform(ctx.userId, organizationId, input.teamId),
    "Team restored",
  );
}
