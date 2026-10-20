const SSL_MODE_ALIASES_FOR_VERIFY_FULL = new Set([
  "prefer",
  "require",
  "verify-ca",
]);

/**
 * pg v8 warns when sslmode is prefer/require/verify-ca (treated as verify-full).
 * Normalize the URL so logs stay quiet while behavior stays verify-full.
 */
export function normalizeDatabaseSslModeInUrl(
  connectionString: string,
): string {
  const trimmed = connectionString.trim();
  if (!trimmed) {
    return connectionString;
  }

  try {
    const url = new URL(trimmed);
    const sslmode = url.searchParams.get("sslmode");
    if (
      sslmode &&
      SSL_MODE_ALIASES_FOR_VERIFY_FULL.has(sslmode.toLowerCase())
    ) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
    return trimmed;
  } catch {
    return connectionString;
  }
}

function finalizeConnectionString(connectionString: string): string {
  return normalizeDatabaseSslModeInUrl(connectionString);
}

/**
 * Prefer Neon pooler in serverless production to avoid cold direct connections.
 * Override with DATABASE_URL_POOLED when set in Vercel/Neon integration.
 */
export function resolveDatabaseConnectionString(
  raw: string,
  pooledOverride?: string,
): string {
  const explicit =
    pooledOverride?.trim() || process.env.DATABASE_URL_POOLED?.trim();
  if (explicit) {
    return finalizeConnectionString(explicit);
  }

  if (process.env.NODE_ENV !== "production") {
    return finalizeConnectionString(raw);
  }

  try {
    const url = new URL(raw);
    if (!url.hostname.includes(".neon.tech")) {
      return finalizeConnectionString(raw);
    }
    if (url.hostname.includes("-pooler")) {
      return finalizeConnectionString(raw);
    }
    const segments = url.hostname.split(".");
    const endpoint = segments[0];
    if (!endpoint) {
      return finalizeConnectionString(raw);
    }
    if (endpoint.startsWith("ep-") && !endpoint.endsWith("-pooler")) {
      segments[0] = `${endpoint}-pooler`;
      url.hostname = segments.join(".");
      return finalizeConnectionString(url.toString());
    }
  } catch {
    return finalizeConnectionString(raw);
  }

  return finalizeConnectionString(raw);
}

/** Warn on production DATABASE_URL values with absent or weak sslmode. */
export function warnOnWeakDatabaseSslMode(
  connectionString: string,
  environment: string,
  warn: (message: string, attributes: Record<string, string>) => void,
): boolean {
  if (environment !== "production") return false;
  try {
    const url = new URL(connectionString.trim());
    if (!url.hostname.includes(".neon.tech")) return false;
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase();
    if (sslmode === "verify-full") return false;
    warn("database connection URL should use sslmode=verify-full", {
      host: url.hostname,
      sslmode: sslmode ?? "missing",
    });
    return true;
  } catch {
    return false;
  }
}
