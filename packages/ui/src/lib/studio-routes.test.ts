import assert from "node:assert/strict";
import test from "node:test";
import { isReservedOrgSlug, routes } from "./studio-routes";

test("resource routes keep applications nested under projects", () => {
  assert.equal(routes.org("acme"), "/acme");
  assert.equal(routes.organizations(), "/organizations");
  assert.equal(routes.organizationsDirectory(), "/organizations?directory=1");
  assert.equal(isReservedOrgSlug("organizations"), false);
  assert.equal(routes.team("acme", "design"), "/acme/teams/design");
  assert.equal(routes.project("acme", "website"), "/acme/website");
  assert.equal(
    routes.app("acme", "website", "reports"),
    "/acme/website/apps/reports",
  );
  assert.equal(routes.env("acme", "website"), "/acme/website/apps/env");
  assert.equal(
    routes.env("acme", "website", "staging"),
    "/acme/website/apps/env/staging",
  );
  assert.equal(routes.tasks("acme", "website"), "/acme/website/apps/tasks");
  assert.equal(
    routes.task("acme", "website", 42),
    "/acme/website/apps/tasks/42",
  );
});

test("resource route builders encode user-provided path segments", () => {
  assert.equal(routes.team("acme", "design team"), "/acme/teams/design%20team");
  assert.equal(
    routes.app("acme", "website", "my/app"),
    "/acme/website/apps/my%2Fapp",
  );
});
