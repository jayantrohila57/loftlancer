export function isActionsAuditEnabled(): boolean {
  return process.env.ACTIONS_AUDIT_ENABLED === "true";
}
