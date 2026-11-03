import { randomBytes, randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { db } from "@loftlancer/drizzle";
import { organizationDomain } from "@loftlancer/drizzle/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  domainChallengeMatches,
  hashDomainChallenge,
  normalizeOrganizationEmailDomain,
} from "../../utils/utils.domain-verification";
import type { OrganizationSecurityDomainListOutput } from "../../utils/validation/utils.organization-admin.validation";

const failed = (message: string) => ({ kind: "failed" as const, message });
type DomainCreated = {
  id: string;
  hostname: string;
  state: "pending";
  txtRecord: { name: string; value: string };
  expiresAt: Date;
};

export async function organizationSecurityDomainListService(
  ctx: RunActionContext,
): Promise<ServiceOutcome<OrganizationSecurityDomainListOutput>> {
  if (!ctx.orgId)
    return {
      kind: "success",
      data: { items: [] },
      message: "No organization selected.",
    };
  const items = await db
    .select({
      id: organizationDomain.id,
      hostname: organizationDomain.hostname,
      purpose: organizationDomain.purpose,
      state: organizationDomain.state,
      challengeExpiresAt: organizationDomain.challengeExpiresAt,
      verifiedAt: organizationDomain.verifiedAt,
      createdAt: organizationDomain.createdAt,
    })
    .from(organizationDomain)
    .where(eq(organizationDomain.organizationId, ctx.orgId))
    .orderBy(desc(organizationDomain.createdAt));
  return {
    kind: "success",
    data: { items },
    message: "Organization security domains loaded.",
  };
}

export async function organizationSecurityDomainCreateService(
  ctx: RunActionContext,
  rawHostname: string,
): Promise<ServiceOutcome<DomainCreated>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  let hostname: string;
  try {
    hostname = normalizeOrganizationEmailDomain(rawHostname);
  } catch (error) {
    return failed(error instanceof Error ? error.message : "Invalid domain.");
  }
  const [existing] = await db
    .select({ id: organizationDomain.id })
    .from(organizationDomain)
    .where(
      and(
        eq(organizationDomain.organizationId, ctx.orgId),
        eq(organizationDomain.hostname, hostname),
        sql`${organizationDomain.state} <> 'revoked'`,
      ),
    )
    .limit(1);
  if (existing) return failed("This domain is already added.");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const id = randomUUID();
  try {
    await db.insert(organizationDomain).values({
      id,
      organizationId: ctx.orgId,
      hostname,
      purpose: "email",
      state: "pending",
      verificationTokenHash: hashDomainChallenge(token),
      challengeExpiresAt: expiresAt,
      createdBy: ctx.userId,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "23505")
      return failed("This domain is already claimed or pending verification.");
    throw error;
  }
  return {
    kind: "success",
    data: {
      id,
      hostname,
      state: "pending",
      txtRecord: { name: `_loftlancer-verification.${hostname}`, value: token },
      expiresAt,
    },
    message: "Add the TXT record to verify this domain.",
  };
}

export async function organizationSecurityDomainVerifyService(
  ctx: RunActionContext,
  domainId: string,
): Promise<ServiceOutcome<{ verified: boolean; message: string }>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const [row] = await db
    .select()
    .from(organizationDomain)
    .where(
      and(
        eq(organizationDomain.id, domainId),
        eq(organizationDomain.organizationId, ctx.orgId),
      ),
    )
    .limit(1);
  if (row?.state !== "pending")
    return failed("Pending domain verification not found.");
  if (row.challengeExpiresAt <= new Date())
    return failed(
      "The verification record expired. Remove the domain and add it again.",
    );
  let timer: ReturnType<typeof setTimeout> | undefined;
  let records: string[][];
  try {
    records = await Promise.race([
      resolveTxt(`_loftlancer-verification.${row.hostname}`),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("DNS lookup timed out")),
          3000,
        );
      }),
    ]);
  } catch {
    return {
      kind: "success",
      data: {
        verified: false,
        message:
          "TXT record was not found yet. DNS changes can take time to appear.",
      },
      message: "Domain verification is pending.",
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (!domainChallengeMatches(records, row.verificationTokenHash))
    return {
      kind: "success",
      data: {
        verified: false,
        message:
          "TXT record does not match the current verification challenge.",
      },
      message: "Domain verification is pending.",
    };
  const [updated] = await db
    .update(organizationDomain)
    .set({ state: "verified", verifiedAt: new Date() })
    .where(
      and(
        eq(organizationDomain.id, row.id),
        eq(organizationDomain.organizationId, ctx.orgId),
        eq(organizationDomain.state, "pending"),
      ),
    )
    .returning({ id: organizationDomain.id });
  if (!updated) return failed("Domain status changed. Refresh and try again.");
  return {
    kind: "success",
    data: { verified: true, message: "Domain ownership verified." },
    message: "Domain ownership verified.",
  };
}

export async function organizationSecurityDomainRevokeService(
  ctx: RunActionContext,
  domainId: string,
): Promise<ServiceOutcome<{ success: true }>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const [row] = await db
    .update(organizationDomain)
    .set({ state: "revoked", revokedAt: new Date() })
    .where(
      and(
        eq(organizationDomain.id, domainId),
        eq(organizationDomain.organizationId, ctx.orgId),
        sql`${organizationDomain.state} <> 'revoked'`,
      ),
    )
    .returning({ id: organizationDomain.id });
  if (!row) return failed("Domain not found.");
  return {
    kind: "success",
    data: { success: true },
    message: "Organization domain revoked.",
  };
}
