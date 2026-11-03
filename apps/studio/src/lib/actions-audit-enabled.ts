import { env } from "@loftlancer/t3-env/web";

export function isActionsAuditEnabledOnClient(): boolean {
  return env.NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED === "true";
}

export function isActionsAuditEnabledOnServer(): boolean {
  return (
    process.env.ACTIONS_AUDIT_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED === "true"
  );
}
