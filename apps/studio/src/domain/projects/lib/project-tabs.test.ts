import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routes } from "@/utils/navigation";
import { getProjectTabs } from "./project-tabs";

describe("getProjectTabs", () => {
  const org = "acme";
  const project = "website";
  const projectRoot = routes.project(org, project);
  const allowed = {
    org,
    project,
    canListMembers: true,
    isCheckingMembers: false,
    canViewActivity: true,
    isCheckingActivity: false,
    activityEnabled: true,
  };

  it("keeps the same project tabs on overview, activity, environment, and app pages", () => {
    const paths = [
      projectRoot,
      routes.projectSection(org, project, "activity"),
      routes.env(org, project, "production"),
      routes.appSettings(org, project, "reports"),
    ];

    const tabLabels = paths.map((pathname) =>
      getProjectTabs({ ...allowed, pathname }).map((tab) => tab.label),
    );

    assert.deepEqual(tabLabels[1], tabLabels[0]);
    assert.deepEqual(tabLabels[2], tabLabels[0]);
    assert.deepEqual(tabLabels[3], tabLabels[0]);
    assert.deepEqual(tabLabels[0], [
      "Overview",
      "Apps",
      "Access",
      "Invitations",
      "Activity",
      "Project settings",
    ]);
  });

  it("keeps unavailable tabs visible and explains why they are disabled", () => {
    const tabs = getProjectTabs({
      ...allowed,
      pathname: projectRoot,
      canListMembers: false,
      canViewActivity: false,
    });

    assert.equal(tabs[3]?.disabled, true);
    assert.equal(
      tabs[3]?.disabledReason,
      "You don't have permission to view project invitations.",
    );
    assert.equal(tabs[4]?.disabled, true);
    assert.equal(
      tabs[4]?.disabledReason,
      "You don't have permission to view project activity.",
    );
  });

  it("marks Apps as active on nested app routes", () => {
    const tabs = getProjectTabs({
      ...allowed,
      pathname: routes.env(org, project, "production"),
    });

    assert.equal(tabs[1]?.active, true);
    assert.equal(tabs[0]?.active, false);
  });
});
