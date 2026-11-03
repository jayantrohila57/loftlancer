import { DEFAULT_AUTH_URL } from "@loftlancer/t3-env/platform";

export function getAccountAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_URL ??
    process.env.NEXT_PUBLIC_ACCOUNT_URL ??
    DEFAULT_AUTH_URL
  ).replace(/\/$/, "");
}

export function accountSettingsUrl(path = "/settings"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAccountAppOrigin()}${normalized}`;
}
