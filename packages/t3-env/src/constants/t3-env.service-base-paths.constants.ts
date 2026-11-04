/** Path prefix for each app when deployed via root `vercel.json` Services. */
export const SERVICE_BASE_PATHS = {
  www: "",
  web: "/app",
  docs: "",
  auth: "/auth",
  account: "/account",
  console: "/console",
  support: "/support",
  studio: "/studio",
  mcp: "",
} as const;
