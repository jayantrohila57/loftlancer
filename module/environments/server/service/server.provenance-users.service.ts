import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { inArray } from "drizzle-orm";

export type ProvenanceUser = {
  id: string;
  name: string;
  image: string | null;
};

export async function loadProvenanceUsers(
  ids: (string | null | undefined)[],
): Promise<Map<string, ProvenanceUser>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({ id: user.id, name: user.name, image: user.image })
    .from(user)
    .where(inArray(user.id, unique));

  return new Map(rows.map((row) => [row.id, row]));
}

export function mapProvenanceUser(
  map: Map<string, ProvenanceUser>,
  id: string | null | undefined,
): ProvenanceUser | null {
  if (!id) return null;
  return map.get(id) ?? null;
}
