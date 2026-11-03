import { DEFAULT_STUDIO_URL } from "@loftlancer/t3-env/platform";

export function getStudioAppOrigin(): string {
  return (process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL).replace(
    /\/$/,
    "",
  );
}

/** Absolute studio URL; the studio home is the origin itself (no trailing slash, #319). */
export function studioDashboardPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/"
    ? getStudioAppOrigin()
    : `${getStudioAppOrigin()}${normalized}`;
}
