const DEFAULT_DOCS_URL = "https://loftlancer.com";

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Public docs site URL (`apps/docs`). */
export function docsSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_DOCS_URL?.trim() ?? DEFAULT_DOCS_URL;
  return trimTrailingSlash(raw);
}

/** Public documentation pages (`/docs` on the docs site), not the landing root. */
export function docsUrl(path = ""): string {
  const suffix = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `${docsSiteUrl()}/docs${suffix}`;
}
