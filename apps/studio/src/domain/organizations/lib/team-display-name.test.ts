import assert from "node:assert/strict";
import test from "node:test";
import { teamDisplayName } from "./team-display-name";

test("marks a team as default when its name matches its organization", () => {
  assert.equal(teamDisplayName("Lucsum", "Lucsum"), "Lucsum (Default)");
});

test("matches names without case or surrounding whitespace differences", () => {
  assert.equal(teamDisplayName(" lucsum ", "LUCSUM"), "lucsum (Default)");
});

test("keeps a separately named team unchanged", () => {
  assert.equal(teamDisplayName("Platform", "Lucsum"), "Platform");
});

test("does not mark a team when the organization name is unavailable", () => {
  assert.equal(teamDisplayName("Lucsum"), "Lucsum");
});
