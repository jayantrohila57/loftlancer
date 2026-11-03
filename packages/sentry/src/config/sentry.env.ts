/** Read Sentry DSN at runtime (server may only have NEXT_PUBLIC_SENTRY_DSN on Vercel). */
export function resolveSentryDsn(): string | undefined {
  const publicDsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";
  const serverDsn = process.env.SENTRY_DSN?.trim() || "";
  const dsn = publicDsn || serverDsn;
  return dsn.length > 0 ? dsn : undefined;
}

export function resolveSentryEnvironment(forBrowser: boolean): string {
  if (forBrowser) {
    return (
      process.env.NEXT_PUBLIC_VERCEL_ENV ??
      process.env.NODE_ENV ??
      "development"
    );
  }
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

export function resolveSentryRelease(): string {
  return `loftlancer@${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}`;
}
