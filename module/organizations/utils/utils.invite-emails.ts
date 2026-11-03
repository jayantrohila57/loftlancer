/** Parse a pasted blob of emails (comma, semicolon, whitespace or newline separated). */
export type ParsedInviteEmail = {
  email: string;
  status: "valid" | "invalid" | "duplicate" | "member" | "pending";
};

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/;

export const ORG_INVITE_ROLES = ["member", "manager", "owner"] as const;
export type OrgInviteRole = (typeof ORG_INVITE_ROLES)[number];

/** Roles an inviter may assign (Better Auth rejects inviting above your own role). */
export function assignableInviteRoles(
  inviterRole: string | null | undefined,
): OrgInviteRole[] {
  const roles = (inviterRole ?? "").split(",").map((r) => r.trim());
  if (roles.includes("owner")) return [...ORG_INVITE_ROLES];
  if (roles.includes("manager") || roles.includes("admin")) {
    return ["member", "manager"];
  }
  return [];
}

export function parseInviteEmails(
  raw: string,
  opts: {
    memberEmails?: Iterable<string>;
    pendingEmails?: Iterable<string>;
  } = {},
): ParsedInviteEmail[] {
  const members = new Set(
    [...(opts.memberEmails ?? [])].map((e) => e.toLowerCase()),
  );
  const pending = new Set(
    [...(opts.pendingEmails ?? [])].map((e) => e.toLowerCase()),
  );
  const seen = new Set<string>();
  const out: ParsedInviteEmail[] = [];
  for (const token of raw.split(/[\s,;]+/)) {
    const cleaned = token.replace(/^<|>$/g, "").trim().toLowerCase();
    if (!cleaned) continue;
    if (seen.has(cleaned)) {
      out.push({ email: cleaned, status: "duplicate" });
      continue;
    }
    seen.add(cleaned);
    if (!EMAIL_RE.test(cleaned))
      out.push({ email: cleaned, status: "invalid" });
    else if (members.has(cleaned))
      out.push({ email: cleaned, status: "member" });
    else if (pending.has(cleaned))
      out.push({ email: cleaned, status: "pending" });
    else out.push({ email: cleaned, status: "valid" });
  }
  return out;
}
