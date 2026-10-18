import { expect, type Page } from "@playwright/test";

/** Matches skeleton rows, sidebar placeholders, and permission spinners. */
const LOADING_SELECTOR = [
  '[data-slot="skeleton"]',
  '[data-slot="sidebar-menu-skeleton"]',
  ".animate-spin",
].join(", ");

/** Kept in sync with `packages/db/src/e2e-demo-project.ts`. */
export const E2E_DEMO_PROJECT_NAME = "E2E Demo Project";

export type StudioLoadedExpectations = {
  userName: string;
  projectName: string;
  version: string;
};

export async function waitForStudioLoaded(
  page: Page,
  expectations: StudioLoadedExpectations,
  options?: {
    projectMustBeVisible?: boolean;
    expectProjectsHeading?: boolean;
  },
) {
  const projectMustBeVisible = options?.projectMustBeVisible ?? true;
  const expectProjectsHeading = options?.expectProjectsHeading ?? false;
  const versionLink = page.getByRole("link", {
    name: `Version ${expectations.version}, view the changelog`,
  });

  const sidebarUser = page.getByTestId("sidebar-user-menu");
  const headerUser = page.getByTestId("header-user-menu");
  if (projectMustBeVisible) {
    await expect(sidebarUser).toContainText(expectations.userName, {
      timeout: 60_000,
    });
  } else {
    await expect(headerUser).toBeVisible({ timeout: 60_000 });
  }
  if (projectMustBeVisible) {
    const projectLink = page
      .locator('[data-sidebar="sidebar"]')
      .getByRole("link", { name: new RegExp(expectations.projectName) })
      .first();
    await expect(projectLink).toBeVisible({ timeout: 60_000 });
    await expect(versionLink).toBeVisible({ timeout: 60_000 });
    await expect(versionLink).toHaveText(`v${expectations.version}`);
  } else {
    await expect(
      page.getByRole("link", {
        name: expectations.projectName,
        exact: true,
      }),
    ).toBeVisible({ timeout: 60_000 });
  }

  await expect(page.locator(LOADING_SELECTOR)).toHaveCount(0, {
    timeout: 60_000,
  });
  await expect(page.locator("main").locator(LOADING_SELECTOR)).toHaveCount(0, {
    timeout: 60_000,
  });
  if (expectProjectsHeading) {
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible({
      timeout: 60_000,
    });
  }
}
