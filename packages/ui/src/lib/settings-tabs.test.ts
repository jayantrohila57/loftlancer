import assert from "node:assert/strict";
import test from "node:test";
import { resolveSettingsTabHref } from "./settings-tabs";

test("selects the most specific route for nested resource pages", () => {
  const tabs = [
    { href: "/acme/project" },
    { href: "/acme/project/apps" },
    { href: "/acme/project/access" },
  ];
  assert.equal(
    resolveSettingsTabHref("/acme/project/apps/env/staging", tabs),
    "/acme/project/apps",
  );
  assert.equal(
    resolveSettingsTabHref("/acme/project/settings", tabs),
    "/acme/project",
  );
});

test("explicit grouped destinations win even when the href differs", () => {
  const tabs = [
    { href: "/acme/org/members", active: true },
    { href: "/acme/org/settings", active: false },
  ];
  assert.equal(
    resolveSettingsTabHref("/acme/org/invitations", tabs),
    "/acme/org/members",
  );
});

test("at most one tab is selected when explicit states conflict", () => {
  assert.equal(
    resolveSettingsTabHref("/acme/org/projects", [
      { href: "/acme/org", active: true },
      { href: "/acme/org/projects", active: true },
    ]),
    "/acme/org/projects",
  );
});
