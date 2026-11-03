export function normalizeEnvironmentName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function slugifyEnvironmentName(name: string): string {
  const normalized = normalizeEnvironmentName(name);
  const slug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "environment";
}

export function assertValidEnvironmentName(name: string): string {
  const normalized = normalizeEnvironmentName(name);
  if (!normalized) {
    throw new Error("Environment name is required");
  }
  if (normalized.length > 64) {
    throw new Error("Environment name must be 64 characters or fewer");
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/.test(normalized)) {
    throw new Error(
      "Use letters, numbers, spaces, hyphens, and underscores only. Name must start with a letter or number.",
    );
  }
  return normalized;
}
