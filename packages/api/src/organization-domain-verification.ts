import { createHash, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { domainToASCII } from "node:url";

export function normalizeOrganizationEmailDomain(value: string): string {
  const candidate = value.trim().toLowerCase().replace(/\.$/, "");
  if (!candidate || candidate.includes("://") || candidate.includes("@")) {
    throw new Error("Enter a hostname such as example.com.");
  }
  const hostname = domainToASCII(candidate);
  if (
    !hostname ||
    hostname.length > 253 ||
    !hostname.includes(".") ||
    isIP(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname
      .split(".")
      .some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
  ) {
    throw new Error("Enter a valid public email domain.");
  }
  return hostname;
}

export function hashDomainChallenge(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function domainChallengeMatches(
  records: string[][],
  expectedHash: string,
) {
  return records.some((record) =>
    (() => {
      const actual = Buffer.from(hashDomainChallenge(record.join("")), "hex");
      const expected = Buffer.from(expectedHash, "hex");
      return (
        actual.length === expected.length && timingSafeEqual(actual, expected)
      );
    })(),
  );
}
