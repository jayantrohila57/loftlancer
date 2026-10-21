import assert from "node:assert/strict";
import test from "node:test";
import {
  domainChallengeMatches,
  hashDomainChallenge,
  normalizeOrganizationEmailDomain,
} from "./organization-domain-verification";

test("normalizes valid email domains to ASCII lowercase", () => {
  assert.equal(
    normalizeOrganizationEmailDomain(" Example.COM. "),
    "example.com",
  );
  assert.equal(
    normalizeOrganizationEmailDomain("bücher.de"),
    "xn--bcher-kva.de",
  );
});

test("rejects URL, address, IP and internal domain inputs", () => {
  for (const value of [
    "https://example.com",
    "person@example.com",
    "127.0.0.1",
    "localhost",
    "service.local",
  ]) {
    assert.throws(() => normalizeOrganizationEmailDomain(value));
  }
});

test("matches TXT answers by challenge hash without exposing expected token", () => {
  const hash = hashDomainChallenge("one-time-secret");
  assert.equal(
    domainChallengeMatches([["unrelated"], ["one-time-secret"]], hash),
    true,
  );
  assert.equal(domainChallengeMatches([["wrong-token"]], hash), false);
});
