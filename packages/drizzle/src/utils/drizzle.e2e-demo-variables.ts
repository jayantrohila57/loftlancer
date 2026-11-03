import { encrypt } from "@loftlancer/crypto";
import { and, eq, inArray } from "drizzle-orm";

import { E2E_DEMO_VARIABLE_DEFS } from "../constants/drizzle.e2e-demo-variables";
import { db } from "../core/drizzle.client";
import { environmentVariable } from "../schema/projects";
import { assertE2eDemoVariableSeedAllowed } from "./drizzle.e2e-demo-seed-guard";
import { activeEnvironmentVariableWhere } from "./drizzle.soft-delete";

export {
  E2E_DEMO_SEED_MARKER,
  E2E_DEMO_VAR_KEY,
  E2E_DEMO_VARIABLE_DEFS,
  type E2eDemoVariableDef,
} from "../constants/drizzle.e2e-demo-variables";

/**
 * Inserts missing demo variables for the E2E development environment (idempotent).
 */
export async function seedE2eDemoVariables(
  environmentId: string,
  createdBy?: string,
) {
  assertE2eDemoVariableSeedAllowed();

  const keys = E2E_DEMO_VARIABLE_DEFS.map((def) => def.key);

  const existing = await db
    .select({ key: environmentVariable.key })
    .from(environmentVariable)
    .where(
      activeEnvironmentVariableWhere(
        and(
          eq(environmentVariable.environmentId, environmentId),
          inArray(environmentVariable.key, keys),
        ),
      ),
    );

  const existingKeys = new Set(existing.map((row) => row.key));

  for (const def of E2E_DEMO_VARIABLE_DEFS) {
    if (existingKeys.has(def.key)) {
      continue;
    }

    await db.insert(environmentVariable).values({
      id: crypto.randomUUID(),
      key: def.key,
      encryptedValue: encrypt(def.value),
      type: def.type,
      note: def.note,
      environmentId,
      createdBy: createdBy ?? null,
      updatedBy: createdBy ?? null,
    });
  }
}
