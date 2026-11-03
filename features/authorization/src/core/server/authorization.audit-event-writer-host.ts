export type AuditTransportContext = {
  source: string;
  oauthClientId: string | null;
  mcpTool: string | null;
};

export type AuditEventWriterHost = {
  resolveTransportContext: () => AuditTransportContext;
};

let host: AuditEventWriterHost | null = null;

export function setAuditEventWriterHost(next: AuditEventWriterHost): void {
  host = next;
}

export function getAuditEventWriterHost(): AuditEventWriterHost {
  if (!host) {
    throw new Error(
      "AuditEventWriterHost not registered — import @loftlancer/orpc/actions/require-action-host-register before writeAuditEvent",
    );
  }
  return host;
}
