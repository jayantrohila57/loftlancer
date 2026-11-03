export function useAudit(_opts?: unknown) {
  return { data: { items: [] }, isPending: false, isError: false };
}
export function useAuditLogs(opts?: unknown) {
  return useAudit(opts);
}
