import type { environmentVariable } from "@loftlancer/drizzle/schema/projects";
import {
  loadProvenanceUsers,
  mapProvenanceUser,
} from "@modules/environments/server/service/server.provenance-users.service";
import { isVariablesV2Enabled } from "@modules/environments/server/service/server.variables-v2.service";
import { decrypt } from "@packages/crypto";

type VariableRow = {
  id: string;
  key: string;
  environmentId: string;
  createdAt: Date;
  updatedAt: Date;
  type?: (typeof environmentVariable.$inferSelect)["type"];
  note?: string | null;
  encryptedValue?: string;
  createdById?: string | null;
  updatedById?: string | null;
};

export async function formatVariableRows(rows: VariableRow[]) {
  if (!isVariablesV2Enabled()) {
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      environmentId: row.environmentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  const userMap = await loadProvenanceUsers(
    rows.flatMap((row) => [row.createdById, row.updatedById]),
  );

  return rows.map((row) => {
    const type = row.type ?? "secret";
    const base = {
      id: row.id,
      key: row.key,
      environmentId: row.environmentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      type,
      note: row.note ?? null,
      createdBy: mapProvenanceUser(userMap, row.createdById),
      updatedBy: mapProvenanceUser(userMap, row.updatedById),
    };

    if (type === "config" && row.encryptedValue) {
      return {
        ...base,
        value: decrypt(row.encryptedValue),
      };
    }

    return base;
  });
}

type EnvironmentRow = {
  id: string;
  name: string;
  slug: string;
  branch: string | null;
  deployedUrl: string | null;
  status: "active" | "inactive" | "building" | "failed";
  isProduction: boolean;
  description: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string | null;
  updatedById?: string | null;
};

export async function formatEnvironmentRows(rows: EnvironmentRow[]) {
  if (!isVariablesV2Enabled()) {
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      branch: row.branch,
      deployedUrl: row.deployedUrl,
      status: row.status,
      isProduction: row.isProduction,
      description: row.description,
      projectId: row.projectId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  const userMap = await loadProvenanceUsers(
    rows.flatMap((row) => [row.createdById, row.updatedById]),
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    branch: row.branch,
    deployedUrl: row.deployedUrl,
    status: row.status,
    isProduction: row.isProduction,
    description: row.description,
    projectId: row.projectId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: mapProvenanceUser(userMap, row.createdById),
    updatedBy: mapProvenanceUser(userMap, row.updatedById),
  }));
}

export async function formatSingleEnvironment(row: EnvironmentRow | undefined) {
  if (!row) return null;
  const [formatted] = await formatEnvironmentRows([row]);
  return formatted ?? null;
}
