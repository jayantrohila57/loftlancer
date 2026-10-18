import { readFileSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "@playwright/test";
import { E2E_PRIMARY_NAME } from "../src/lib/e2e-users";
import { requireE2eTestSecret } from "./require-e2e-test-secret";
import {
  E2E_DEMO_PROJECT_NAME,
  waitForStudioLoaded,
} from "./wait-for-studio-loaded";

const root = path.resolve(__dirname, "../../..");
const faviconDirs = [
  "apps/studio/public/favicon",
  "apps/docs/public/favicon",
  "apps/auth/public/favicon",
].map((p) => path.join(root, p));

const outDir = path.join(root, ".tmp/pwa-screenshots");

const appVersion = (
  JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
    version: string;
  }
).version;

test.describe.configure({ mode: "serial" });

test("capture Loftlancer PWA screenshots", async ({
  page,
  context,
  baseURL,
}) => {
  test.skip(
    !process.env.CAPTURE_PWA_SCREENSHOTS,
    "Set CAPTURE_PWA_SCREENSHOTS=1",
  );

  const login = await page.request.post("/api/e2e/login", {
    headers: {
      "content-type": "application/json",
      "x-e2e-secret": requireE2eTestSecret(),
    },
    data: { persona: "primary" },
  });
  test.expect(login.ok()).toBeTruthy();

  const { cookies } = await page.request.storageState();
  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  await mkdir(outDir, { recursive: true });
  const studioWide = path.join(outDir, "studio-wide.png");
  const studioNarrow = path.join(outDir, "studio-narrow.png");

  const loadedExpectations = {
    userName: E2E_PRIMARY_NAME,
    projectName: E2E_DEMO_PROJECT_NAME,
    version: appVersion,
  };

  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
  await waitForStudioLoaded(page, loadedExpectations, {
    expectProjectsHeading: false,
  });

  const projectsNav = page.getByRole("link", { name: "Projects", exact: true });
  await projectsNav.click();
  await page.waitForURL(/\/projects$/);
  await waitForStudioLoaded(page, loadedExpectations, {
    expectProjectsHeading: true,
  });

  await page.setViewportSize({ width: 1200, height: 630 });
  await waitForStudioLoaded(page, loadedExpectations, {
    expectProjectsHeading: true,
  });
  await page.screenshot({ path: studioWide, type: "png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await waitForStudioLoaded(page, loadedExpectations, {
    projectMustBeVisible: false,
    expectProjectsHeading: true,
  });
  await page.screenshot({ path: studioNarrow, type: "png" });

  for (const dir of faviconDirs) {
    await mkdir(dir, { recursive: true });
    await copyFile(studioWide, path.join(dir, "screenshot-wide.png"));
    await copyFile(studioNarrow, path.join(dir, "screenshot-narrow.png"));
  }
});
