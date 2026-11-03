export function variableAuditKeyPayload(key: string): string {
  return JSON.stringify({ key });
}

export function variableBulkImportAuditPayload(input: {
  keys: string[];
  overwrite: boolean;
  result: { created: number; updated: number; skipped: number };
}): string {
  return JSON.stringify({
    keys: input.keys,
    count: input.keys.length,
    overwrite: input.overwrite,
    result: input.result,
  });
}
