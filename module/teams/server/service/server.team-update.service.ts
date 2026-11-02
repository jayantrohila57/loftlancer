import { db } from "@loftlancer/db";
import { team } from "@loftlancer/db/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import type { z } from "zod";
import type { teamUpdateInputSchema } from "../../utils/validation/utils.team-operations.validation";
import { teamOutcome } from "./server.team-outcome.service";

async function perform(
  userId: string,
  organizationId: string,
  teamId: string,
  name: string,
  details: { description?: string | null; purpose?: string | null } = {},
) {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error("invalid_team_name");
  const values: {
    name: string;
    updatedAt: Date;
    updatedBy: string;
    description?: string | null;
    purpose?: string | null;
  } = { name: normalizedName, updatedAt: new Date(), updatedBy: userId };
  if (details.description !== undefined)
    values.description = details.description?.trim() || null;
  if (details.purpose !== undefined)
    values.purpose = details.purpose?.trim() || null;
  const [row] = await db
    .update(team)
    .set(values)
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .returning({
      id: team.id,
      name: team.name,
      description: team.description,
      purpose: team.purpose,
      updatedAt: team.updatedAt,
      updatedBy: team.updatedBy,
    });
  if (!row) {
    throw new Error("team_not_found");
  }
  return row;
}

export function teamUpdateService(
  ctx: RunActionContext,
  input: z.infer<typeof teamUpdateInputSchema>,
) {
  if (!ctx.orgId)
    return Promise.resolve({
      kind: "failed" as const,
      message: "Select an organization to continue.",
    });
  const organizationId = ctx.orgId;
  return teamOutcome(
    () =>
      perform(ctx.userId, organizationId, input.teamId, input.name, {
        description: input.description,
        purpose: input.purpose,
      }),
    "Team updated",
  );
}
