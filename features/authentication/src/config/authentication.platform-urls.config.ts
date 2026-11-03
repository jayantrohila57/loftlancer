import { resolvePublicServiceUrl } from "@loftlancer/t3-env/vercel-services";

import {
  DEFAULT_AUTH_URL,
  DEFAULT_CONSOLE_URL,
  DEFAULT_STUDIO_URL,
} from "../constants/authentication.platform-url.constants";

export function authUrlDefault(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL;
}

export function studioUrlDefault(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("studio")
    : DEFAULT_STUDIO_URL;
}

export function consoleUrlDefault(): string {
  return process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("console")
    : DEFAULT_CONSOLE_URL;
}

export function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
