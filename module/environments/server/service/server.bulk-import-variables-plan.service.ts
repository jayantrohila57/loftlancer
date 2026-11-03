export type BulkVariableImportRow = {
  id: string;
  key: string;
  encryptedValue: string;
};

export type BulkVariableImportPlan = {
  created: number;
  updated: number;
  skipped: number;
  insertRows: BulkVariableImportRow[];
  updateRows: BulkVariableImportRow[];
};

export function planBulkVariableImport(
  variables: ReadonlyArray<{ key: string; value: string }>,
  existingKeyMap: ReadonlyMap<string, string>,
  overwrite: boolean,
  encryptValue: (value: string) => string,
): BulkVariableImportPlan {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const insertRows: BulkVariableImportRow[] = [];
  const updateRows: BulkVariableImportRow[] = [];

  for (const variable of variables) {
    const existingId = existingKeyMap.get(variable.key);
    const encryptedValue = encryptValue(variable.value);

    if (existingId) {
      if (overwrite) {
        updateRows.push({ id: existingId, key: variable.key, encryptedValue });
        updated++;
      } else {
        skipped++;
      }
      continue;
    }

    insertRows.push({
      id: crypto.randomUUID(),
      key: variable.key,
      encryptedValue,
    });
    created++;
  }

  return { created, updated, skipped, insertRows, updateRows };
}
