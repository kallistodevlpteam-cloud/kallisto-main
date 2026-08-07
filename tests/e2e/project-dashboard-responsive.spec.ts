import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const PROJECT_ROUTE = "/projects/proj-001";
const SCREENSHOT_DIR = resolve(
  process.cwd(),
  "docs/audits/project-dashboard-responsive/gate-1",
);

const VIEWPORTS = [
  { width: 1920, height: 1080, mode: "rail", screenshot: true },
  { width: 1536, height: 864, mode: "rail" },
  { width: 1440, height: 900, mode: "rail", screenshot: true },
  { width: 1366, height: 768, mode: "rail" },
  { width: 1280, height: 720, mode: "rail", screenshot: true },
  { width: 1200, height: 800, mode: "rail" },
  { width: 1100, height: 800, mode: "drawer" },
  { width: 1024, height: 768, mode: "drawer", screenshot: true },
] as const;

interface ViewportMeasurement {
  viewport: string;
  mode: string | undefined;
  sidebarWidth: number;
  dashboardWidth: number;
  mainWidth: number;
  updatesWidth: number;
  gap: number;
  workspaceScrollTop: number;
  mainScrollTop: number;
}

const viewportMeasurements: ViewportMeasurement[] = [];

async function openProject(page: Page, expectedMode: "rail" | "drawer") {
  await page.goto(PROJECT_ROUTE);
  await expect(page.locator(".poc-left-column")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".project-viewer-img")
        .evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await expect(page.locator(".poc-wrapper")).toHaveAttribute(
    "data-updates-mode",
    expectedMode,
  );
}

test.describe("project dashboard Gate 1 responsive layout", () => {
  test.afterAll(() => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    writeFileSync(
      resolve(SCREENSHOT_DIR, "project-dashboard-gate-1-measurements.json"),
      `${JSON.stringify(viewportMeasurements, null, 2)}\n`,
      "utf8",
    );
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} uses ${viewport.mode} with bounded main scrolling`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openProject(page, viewport.mode);

      if ("screenshot" in viewport && viewport.screenshot) {
        mkdirSync(SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({
          path: resolve(
            SCREENSHOT_DIR,
            `project-dashboard-${viewport.width}x${viewport.height}.png`,
          ),
          fullPage: false,
        });
      }

      const geometry = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>(".workspace");
        const wrapper = document.querySelector<HTMLElement>(".poc-wrapper");
        const main = document.querySelector<HTMLElement>(".poc-left-column");
        const updates = document.querySelector<HTMLElement>(".poc-right-column");
        if (!workspace || !wrapper || !main || !updates) {
          throw new Error("Project dashboard geometry nodes were not rendered");
        }

        const mainRect = main.getBoundingClientRect();
        const updatesRect = updates.getBoundingClientRect();
        return {
          documentOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth,
          mode: wrapper.dataset.updatesMode,
          sidebarWidth:
            document.querySelector<HTMLElement>(".sidebar")?.getBoundingClientRect()
              .width ?? 0,
          dashboardWidth: wrapper.getBoundingClientRect().width,
          mainWidth: mainRect.width,
          updatesWidth: updatesRect.width,
          gap: updatesRect.left - mainRect.right,
          updatesDisplay: getComputedStyle(updates).display,
          updatesPosition: getComputedStyle(updates).position,
          gridColumns: getComputedStyle(wrapper).gridTemplateColumns,
          leftVerticalRange: main.scrollHeight - main.clientHeight,
          leftHorizontalRange: main.scrollWidth - main.clientWidth,
          workspaceInitialScrollTop: workspace.scrollTop,
        };
      });

      expect(geometry.documentOverflow).toBe(false);
      expect(geometry.leftVerticalRange).toBeGreaterThanOrEqual(0);
      expect(geometry.leftHorizontalRange).toBe(0);

      if (viewport.mode === "rail") {
        expect(geometry.mainWidth).toBeGreaterThanOrEqual(679.5);
        expect(geometry.updatesWidth).toBeGreaterThanOrEqual(339.5);
        expect(geometry.updatesWidth).toBeLessThanOrEqual(400.5);
        expect(geometry.gap).toBeGreaterThanOrEqual(23.5);
        expect(geometry.gap).toBeLessThanOrEqual(24.5);
        expect(geometry.updatesPosition).toBe("static");
      } else {
        expect(geometry.updatesDisplay).toBe("none");
        expect(geometry.gridColumns.trim().split(/\s+/)).toHaveLength(1);
      }

      await page.evaluate(() => {
        const left = document.querySelector<HTMLElement>(".poc-left-column");
        if (!left) throw new Error("Missing main project column");
        const sentinel = document.createElement("section");
        sentinel.dataset.testid = "future-section-sentinel";
        sentinel.style.minHeight = "720px";
        sentinel.textContent = "Future project section sentinel";
        left.append(sentinel);
      });

      const overview = page.locator(".project-overview-section");
      await overview.scrollIntoViewIfNeeded();
      await expect(overview).toBeInViewport();

      const sentinel = page.locator('[data-testid="future-section-sentinel"]');
      await page.locator(".poc-left-column").evaluate((main) => {
        main.scrollTop = main.scrollHeight;
      });
      await expect(sentinel).toBeInViewport();

      const scrollState = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>(".workspace");
        const main = document.querySelector<HTMLElement>(".poc-left-column");
        if (!workspace || !main) throw new Error("Missing scroll-owner nodes");
        return {
          documentScrollTop: document.scrollingElement?.scrollTop ?? -1,
          workspaceScrollTop: workspace.scrollTop,
          wrapperScrollTop:
            document.querySelector<HTMLElement>(".poc-wrapper")?.scrollTop ?? -1,
          mainScrollTop: main.scrollTop,
          leftVerticalRange: main.scrollHeight - main.clientHeight,
          leftHorizontalRange: main.scrollWidth - main.clientWidth,
          documentOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });

      expect(scrollState.documentScrollTop).toBe(0);
      expect(scrollState.workspaceScrollTop).toBe(geometry.workspaceInitialScrollTop);
      expect(scrollState.wrapperScrollTop).toBe(0);
      expect(scrollState.mainScrollTop).toBeGreaterThan(0);
      expect(scrollState.leftVerticalRange).toBeGreaterThan(0);
      expect(scrollState.leftHorizontalRange).toBe(0);
      expect(scrollState.documentOverflow).toBe(false);

      viewportMeasurements.push({
        viewport: `${viewport.width}x${viewport.height}`,
        mode: geometry.mode,
        sidebarWidth: geometry.sidebarWidth,
        dashboardWidth: geometry.dashboardWidth,
        mainWidth: geometry.mainWidth,
        updatesWidth: geometry.updatesWidth,
        gap: viewport.mode === "rail" ? geometry.gap : 0,
        workspaceScrollTop: scrollState.workspaceScrollTop,
        mainScrollTop: scrollState.mainScrollTop,
      });
    });
  }

  test("temporary Updates drawer traps focus, closes with Escape, and restores focus", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await openProject(page, "drawer");

    const trigger = page.getByRole("button", { name: "Updates", exact: true });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Updates" });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "Close project updates" }).last()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("Odin switches Updates to drawer before the main project area becomes narrow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openProject(page, "rail");

    await page.getByRole("button", { name: /^ask odin$/i }).click();
    await expect(page.getByRole("complementary", { name: /odin assistant/i })).toBeVisible();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute(
      "data-updates-mode",
      "drawer",
    );

    const mainWidth = await page
      .locator(".poc-left-column")
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(mainWidth).toBeGreaterThanOrEqual(679.5);

    await page.getByRole("button", { name: /close assistant panel/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute(
      "data-updates-mode",
      "rail",
    );
  });

  test("Odin preserves a valid rail at a wide desktop capacity", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openProject(page, "rail");
    await page.getByRole("button", { name: /^ask odin$/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute(
      "data-updates-mode",
      "rail",
    );

    const widths = await page.evaluate(() => ({
      main: document
        .querySelector<HTMLElement>(".poc-left-column")!
        .getBoundingClientRect().width,
      updates: document
        .querySelector<HTMLElement>(".poc-right-column")!
        .getBoundingClientRect().width,
    }));
    expect(widths.main).toBeGreaterThanOrEqual(679.5);
    expect(widths.updates).toBeGreaterThanOrEqual(339.5);
    expect(widths.updates).toBeLessThanOrEqual(400.5);
  });

  test("Schedule, Tasks, and Documents retain their fixed workspace ownership", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 800 });

    const expectedOwnership = {
      timeline: { workspace: "auto", container: "visible", content: "visible" },
      tasks: { workspace: "hidden", container: "hidden", content: "hidden" },
      documents: { workspace: "hidden", container: "hidden", content: "hidden" },
    } as const;

    for (const route of ["timeline", "tasks", "documents"] as const) {
      await page.goto(`/projects/proj-001/${route}`);
      await expect(page.locator(".route-content-wrap")).toBeVisible();
      const ownership = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>(".workspace");
        const container = document.querySelector<HTMLElement>(".workspace-container");
        const content = document.querySelector<HTMLElement>(".route-content-wrap");
        if (!workspace || !container || !content) {
          throw new Error("Missing shared route workspace nodes");
        }
        return {
          workspaceOverflow: getComputedStyle(workspace).overflowY,
          containerOverflow: getComputedStyle(container).overflow,
          contentOverflow: getComputedStyle(content).overflow,
        };
      });

      expect(ownership.workspaceOverflow).toBe(expectedOwnership[route].workspace);
      expect(ownership.containerOverflow).toBe(expectedOwnership[route].container);
      expect(ownership.contentOverflow).toBe(expectedOwnership[route].content);
    }
  });
});
