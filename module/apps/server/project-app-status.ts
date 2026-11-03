export type ProjectAppStatus = "active" | "uninstalled" | "available";

/** A purged registry app remains installable; only active and retained rows are special. */
export function resolveProjectAppStatus(
  status: string | null | undefined,
): ProjectAppStatus {
  if (status === "active" || status === "uninstalled") return status;
  return "available";
}
