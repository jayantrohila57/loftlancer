export function parseListUrlParam<T extends string>(
  value: string | null,
  allowed: Set<T>,
): T[] {
  if (!value?.trim()) return [];
  const seen = new Set<T>();
  const result: T[] = [];
  for (const part of value.split(",")) {
    const token = part.trim() as T;
    if (allowed.has(token) && !seen.has(token)) {
      seen.add(token);
      result.push(token);
    }
  }
  return result;
}
