import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routes } from "@/utils/navigation";
import { getProjectFrameBackTarget } from "./projects.project.frame.back";

describe("getProjectFrameBackTarget", () => {
  const org = "acme";
  const project = "website";
  const projectRoot = routes.project(org, project);

  it("returns the expected parent for project destinations", () => {
    const cases = [
      [projectRoot, routes.projects(org), "Projects"],
      [
        routes.projectSection(org, project, "apps"),
        projectRoot,
        "Project overview",
      ],
      [
        routes.app(org, project, "tasks"),
        routes.projectSection(org, project, "apps"),
        "Apps",
      ],
      [routes.task(org, project, 12), routes.tasks(org, project), "Tasks"],
      [
        `${routes.tasks(org, project)}/settings`,
        routes.tasks(org, project),
        "Tasks",
      ],
      [
        routes.env(org, project, "production"),
        routes.env(org, project),
        "Environments",
      ],
      [
        `${routes.app(org, project, "reports")}/settings`,
        routes.app(org, project, "reports"),
        "App",
      ],
      [
        routes.projectSection(org, project, "access"),
        projectRoot,
        "Project overview",
      ],
    ] as const;

    for (const [pathname, href, label] of cases) {
      assert.deepEqual(getProjectFrameBackTarget(pathname, org, project), {
        href,
        label,
      });
    }
  });

  it("keeps legacy Tasks links pointed at the canonical task list", () => {
    assert.deepEqual(
      getProjectFrameBackTarget(`${projectRoot}/tasks/settings`, org, project),
      { href: routes.tasks(org, project), label: "Tasks" },
    );
  });
});
