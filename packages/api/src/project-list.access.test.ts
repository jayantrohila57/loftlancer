import assert from "node:assert/strict";

import { readFileSync } from "node:fs";

import { dirname, join } from "node:path";

import { describe, it } from "node:test";

import { fileURLToPath } from "node:url";
import type { OrgRole } from "@loftlancer/actions";
import { canReadProject, evaluatePermission } from "@loftlancer/actions";

import type { ProjectAccessContext } from "@loftlancer/actions/evaluate";

const projectListSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "project-list.ts"),

  "utf8",
);

const orgAccessSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "org-access.ts"),

  "utf8",
);

const projectsRouterSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "routers", "projects.ts"),

  "utf8",
);

type ReadScenario = {
  name: string;

  orgRole: OrgRole | null;

  project: ProjectAccessContext;

  expectListed: boolean;
};

const readScenarios: ReadScenario[] = [
  {
    name: "owner",

    orgRole: "owner",

    project: {
      isProjectCreator: false,

      isProjectManager: false,

      memberGrants: [],

      hasTeamLink: false,
    },

    expectListed: true,
  },

  {
    name: "manager assigned to project",

    orgRole: "manager",

    project: { isProjectManager: true, isProjectCreator: false },

    expectListed: true,
  },

  {
    name: "manager creator not assigned",

    orgRole: "manager",

    project: { isProjectManager: false, isProjectCreator: true },

    expectListed: true,
  },

  {
    name: "manager neither assigned nor creator",

    orgRole: "manager",

    project: { isProjectManager: false, isProjectCreator: false },

    expectListed: false,
  },

  {
    name: "grantee with team link and project.read",

    orgRole: "member",

    project: {
      hasTeamLink: true,

      memberGrants: ["project.read"],
    },

    expectListed: true,
  },

  {
    name: "grantee with team link but without project.read",

    orgRole: "member",

    project: {
      hasTeamLink: true,

      memberGrants: ["variable.read"],
    },

    expectListed: false,
  },

  {
    name: "outsider (no org role)",

    orgRole: null,

    project: { isProjectManager: true, hasTeamLink: true },

    expectListed: false,
  },
];

describe("project list/detail read alignment (#26)", () => {
  for (const scenario of readScenarios) {
    it(`canReadProject matches list/detail for ${scenario.name}`, () => {
      assert.equal(
        canReadProject(scenario.orgRole, scenario.project),

        scenario.expectListed,

        `expected project.read=${scenario.expectListed} for ${scenario.name}`,
      );
    });
  }

  it("assertProjectAccess uses the same canReadProject predicate as list scope", () => {
    assert.match(orgAccessSource, /canReadProject\(/);

    assert.doesNotMatch(
      orgAccessSource,

      /evaluatePermission\([\s\S]*project\.read/,

      "detail access must go through canReadProject",
    );
  });

  it("listAccessibleProjectIds filters membership with activeMemberWhere", () => {
    assert.match(
      projectListSource,
      /listAccessibleProjectIds[\s\S]*activeMemberWhere/,
    );
  });

  it("listAccessibleProjectIds encodes the same manager and member rules", () => {
    assert.match(
      projectListSource,

      /orgRole === "manager"[\s\S]*eq\(project\.userId, userId\)/,

      "managers must see projects they created",
    );

    assert.match(
      projectListSource,

      /project\.read.*ANY\(\$\{projectMemberGrant\.grants\}\)/,

      "members must have project.read on their grant row",
    );
  });
});

describe("project list RBAC (project.read)", () => {
  it("allows org owners to read any project", () => {
    const decision = evaluatePermission({
      action: "project.read",

      orgRole: "owner",

      project: {
        isProjectCreator: false,

        isProjectManager: false,

        memberGrants: [],

        hasTeamLink: false,
      },
    });

    assert.equal(decision.allowed, true);
  });

  it("allows org managers assigned as project manager", () => {
    const decision = evaluatePermission({
      action: "project.read",

      orgRole: "manager",

      project: { isProjectManager: true },
    });

    assert.equal(decision.allowed, true);
  });

  it("allows org managers who created the project without assignment", () => {
    const decision = evaluatePermission({
      action: "project.read",

      orgRole: "manager",

      project: { isProjectManager: false, isProjectCreator: true },
    });

    assert.equal(decision.allowed, true);
  });

  it("denies org managers without assignment or creator role", () => {
    const decision = evaluatePermission({
      action: "project.read",

      orgRole: "manager",

      project: { isProjectManager: false, isProjectCreator: false },
    });

    assert.equal(decision.allowed, false);
  });

  it("allows members with team link and project.read grant", () => {
    const decision = evaluatePermission({
      action: "project.read",

      orgRole: "member",

      project: {
        hasTeamLink: true,

        memberGrants: ["project.read"],
      },
    });

    assert.equal(decision.allowed, true);
  });

  it("denies members without team link or grant (non-member on project)", () => {
    const withoutTeam = evaluatePermission({
      action: "project.read",

      orgRole: "member",

      project: { hasTeamLink: false, memberGrants: ["project.read"] },
    });

    assert.equal(withoutTeam.allowed, false);

    const withoutGrant = evaluatePermission({
      action: "project.read",

      orgRole: "member",

      project: { hasTeamLink: true, memberGrants: [] },
    });

    assert.equal(withoutGrant.allowed, false);
  });

  it("denies outsiders (no org role)", () => {
    const decision = evaluatePermission({
      action: "project.read",

      orgRole: null,

      project: { isProjectManager: true, hasTeamLink: true },
    });

    assert.equal(decision.allowed, false);
  });
});

describe("project list/detail scope alignment (#26)", () => {
  it("resolves accessible IDs by org role in listAccessibleProjectIds", () => {
    assert.match(projectListSource, /orgRole === "owner"/);

    assert.match(projectListSource, /orgRole === "manager"/);

    assert.match(projectListSource, /projectMemberGrant/);
  });

  it("projectReadWhere falls back to owner filter only when orgs are off", () => {
    assert.match(
      projectListSource,

      /listAccessibleProjectIds[\s\S]*projectListFilter/,
    );
  });

  it("projects list and get share projectReadWhere", () => {
    const listBlock = projectsRouterSource.match(
      /list:\s*orgProcedure[\s\S]*?get:\s*orgProcedure/,
    )?.[0];

    assert.ok(listBlock, "expected list procedure before get");

    assert.match(listBlock, /projectReadWhere/);

    assert.doesNotMatch(
      listBlock,

      /projectListFilter\(/,

      "list must not use owner-only projectListFilter",
    );

    const getBlock = projectsRouterSource.match(
      /get:\s*orgProcedure[\s\S]*?getBySlug:\s*orgProcedure/,
    )?.[0];

    assert.ok(getBlock, "expected get procedure before getBySlug");

    assert.match(getBlock, /projectReadWhere/);

    assert.match(getBlock, /assertProjectAccess/);

    assert.doesNotMatch(getBlock, /projectListFilter\(/);

    const mutationBlock = projectsRouterSource.match(
      /update:\s*orgProcedure[\s\S]*$/,
    )?.[0];

    assert.ok(mutationBlock, "expected update+ mutation procedures");

    assert.match(mutationBlock, /assertProjectAccess/);

    assert.match(mutationBlock, /projectReadWhere/);
  });
});
