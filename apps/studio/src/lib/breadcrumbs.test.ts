import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routes } from "@/utils/navigation";
import { generateBreadcrumbs, resolveBreadcrumbLabel } from "./breadcrumbs";

describe("breadcrumb names", () => {
  it("uses the cached team name and never exposes a team ID", () => {
    const teamId = "PbEkiLT6p9DJ4Dw4C3rxKYrXJtH6Cpgc";
    const crumb = generateBreadcrumbs(routes.team("lucsum", teamId)).at(-1);

    assert.ok(crumb);
    assert.equal(crumb.kind, "team");
    assert.equal(
      resolveBreadcrumbLabel(crumb, { teamName: "Platform" }),
      "Platform",
    );
    assert.equal(resolveBreadcrumbLabel(crumb), "Team");
  });

  it("uses cached organization and project names without loading placeholders", () => {
    const orgCrumb = generateBreadcrumbs(routes.org("lucsum"))[0];
    const projectCrumb = generateBreadcrumbs(
      routes.project("lucsum", "e-commerce"),
    )[1];

    assert.ok(orgCrumb);
    assert.ok(projectCrumb);
    assert.equal(resolveBreadcrumbLabel(orgCrumb), "lucsum");
    assert.equal(
      resolveBreadcrumbLabel(orgCrumb, { organizationName: "Lucsum" }),
      "Lucsum",
    );
    assert.equal(resolveBreadcrumbLabel(projectCrumb), "e-commerce");
    assert.equal(
      resolveBreadcrumbLabel(projectCrumb, { projectName: "E-commerce" }),
      "E-commerce",
    );
  });

  it("keeps the Environments breadcrumb aligned with its page title", () => {
    const crumb = generateBreadcrumbs(routes.env("lucsum", "e-commerce")).at(
      -1,
    );

    assert.ok(crumb);
    assert.equal(resolveBreadcrumbLabel(crumb), "Environments");
  });

  it("uses the visible section title for the final breadcrumb", () => {
    const teamMembers = generateBreadcrumbs(
      routes.teamSection("lucsum", "team-id", "members"),
    );
    const activity = generateBreadcrumbs(
      routes.projectSection("lucsum", "e-commerce", "activity"),
    );

    const membersCrumb = teamMembers.at(-1);
    const activityCrumb = activity.at(-1);
    assert.ok(membersCrumb);
    assert.ok(activityCrumb);
    assert.equal(resolveBreadcrumbLabel(membersCrumb), "Members");
    assert.equal(resolveBreadcrumbLabel(activityCrumb), "Activity");
  });
});
