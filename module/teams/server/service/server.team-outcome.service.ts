import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";

const expected: Record<string, string> = {
  team_not_found: "Team not found.",
  "Team not found": "Team not found.",
  organization_not_found: "Organization not found.",
  invalid_team_name: "Team name is required.",
  soft_deletes_disabled: "Restoring deleted teams is disabled.",
  organization_member_not_found: "Organization member not found.",
  team_member_not_found: "Team member not found.",
  team_requires_lead: "A team must have at least one lead.",
};
type OutcomeItem<T> = T extends (infer Item)[] ? Item : T;
export async function teamOutcome<T>(
  handler: () => Promise<T>,
  message: string,
): Promise<ServiceOutcome<OutcomeItem<T>>> {
  try {
    return {
      kind: "success",
      data: (await handler()) as OutcomeItem<T> | OutcomeItem<T>[],
      message,
    };
  } catch (error) {
    const known = error instanceof Error ? expected[error.message] : undefined;
    if (known) return { kind: "failed", message: known };
    throw error;
  }
}
