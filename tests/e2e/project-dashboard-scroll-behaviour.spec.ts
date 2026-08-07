import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const PROJECT_ROUTE = "/projects/proj-001";
const EVIDENCE_DIR = resolve(
  process.cwd(),
  "docs/audits/project-dashboard-responsive/scroll-correction",
);

const VIEWPORTS = [
  { width: 1920, height: 1080, mode: "rail", screenshot: "project-dashboard-scroll-1920x1080.png" },
  { width: 1536, height: 864, mode: "rail" },
  { width: 1440, height: 900, mode: "rail", screenshot: "project-dashboard-scroll-1440x900.png" },
  { width: 1366, height: 768, mode: "rail" },
  { width: 1280, height: 720, mode: "rail", screenshot: "project-dashboard-scroll-1280x720.png" },
  { width: 1200, height: 800, mode: "rail", screenshot: "project-dashboard-scroll-1200x800.png" },
  { width: 1199, height: 800, mode: "drawer" },
  { width: 1100, height: 800, mode: "drawer", screenshot: "project-dashboard-scroll-1100x800.png" },
  { width: 1024, height: 768, mode: "drawer", screenshot: "project-dashboard-scroll-1024x768.png" },
] as const;

interface ScrollMeasurement {
  viewport: string;
  mode: "rail" | "drawer";
  workspaceHeight: number;
  headingHeight: number;
  dashboardHeight: number;
  mainHeight: number;
  updatesHeight: number;
  feedHeight: number;
  composerHeight: number;
  mainWidth: number;
  updatesWidth: number;
  gap: number;
  documentScrollTop: number;
  workspaceScrollTop: number;
  wrapperScrollTop: number;
  mainScrollTopAfterGallery: number;
  mainScrollTopAfterOverview: number;
  feedScrollTopAfterUpdates: number;
  mainHorizontalRange: number;
  feedHorizontalRange: number;
  composerVisible: boolean;
  headingVisible: boolean;
  topbarVisible: boolean;
}

const measurements: ScrollMeasurement[] = [];

async function openProject(page: Page, mode: "rail" | "drawer") {
  await page.goto(PROJECT_ROUTE);
  await expect(page.locator(".poc-left-column")).toBeVisible();
  await expect(page.locator(".poc-wrapper")).toHaveAttribute(
    "data-updates-mode",
    mode,
  );
  await expect
    .poll(() =>
      page.locator(".project-viewer-img").evaluate((node) => {
        const image = node as HTMLImageElement;
        return image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);

  if (mode === "drawer") {
    await page.getByRole("button", { name: "Updates", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Updates" })).toBeVisible();
  }
}

async function installLongFixtures(page: Page) {
  await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>(".poc-left-column");
    const feed = document.querySelector<HTMLElement>(".poc-sections-card");
    if (!main || !feed) throw new Error("Project scroll regions are missing");

    const future = document.createElement("section");
    future.dataset.testid = "scroll-future-section";
    future.style.minHeight = "720px";
    future.style.padding = "24px 0";
    future.textContent = "Future project section below Project Overview";
    main.append(future);

    const cards = Array.from(feed.querySelectorAll<HTMLElement>(".post-item-card"));
    const source = cards[0];
    if (!source) throw new Error("Default update fixture is unavailable");
    while (feed.querySelectorAll(".post-item-card").length < 12) {
      const clone = source.cloneNode(true) as HTMLElement;
      clone.dataset.testClone = String(
        feed.querySelectorAll(".post-item-card").length + 1,
      );
      feed.append(clone);
    }
  });

  await page.getByLabel("Share a project update").fill(
    Array.from(
      { length: 10 },
      (_, index) => `Line ${index + 1}: coordinated project update`,
    ).join("\n"),
  );
}

test.describe("project dashboard bounded scroll correction", () => {
  test.beforeAll(() => mkdirSync(EVIDENCE_DIR, { recursive: true }));

  test.afterAll(() => {
    writeFileSync(
      resolve(EVIDENCE_DIR, "project-dashboard-scroll-measurements.json"),
      `${JSON.stringify(measurements, null, 2)}\n`,
      "utf8",
    );
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} keeps scrolling inside the intended project regions`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openProject(page, viewport.mode);
      await installLongFixtures(page);

      const initial = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>(".workspace")!;
        const container = document.querySelector<HTMLElement>(
          ".project-dashboard-page",
        )!;
        const heading = document.querySelector<HTMLElement>(".page-heading")!;
        const wrapper = document.querySelector<HTMLElement>(".poc-wrapper")!;
        const main = document.querySelector<HTMLElement>(".poc-left-column")!;
        const panel = document.querySelector<HTMLElement>(".poc-right-column")!;
        const feed = document.querySelector<HTMLElement>(".poc-sections-card")!;
        const composer = document.querySelector<HTMLElement>(
          "[data-updates-composer]",
        )!;
        const topbar = document.querySelector<HTMLElement>(".topbar")!;
        const mainRect = main.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const composerRect = composer.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const topbarRect = topbar.getBoundingClientRect();
        const containerStyle = getComputedStyle(container);

        return {
          workspaceHeight: workspace.clientHeight,
          containerHeight: container.clientHeight,
          containerContentHeight:
            container.clientHeight -
            Number.parseFloat(containerStyle.paddingTop) -
            Number.parseFloat(containerStyle.paddingBottom),
          headingHeight: headingRect.height,
          dashboardHeight: wrapper.clientHeight,
          mainHeight: main.clientHeight,
          updatesHeight: panel.clientHeight,
          feedHeight: feed.clientHeight,
          composerHeight: composerRect.height,
          mainWidth: mainRect.width,
          updatesWidth: panelRect.width,
          gap: panelRect.left - mainRect.right,
          documentScrollTop: document.scrollingElement?.scrollTop ?? -1,
          workspaceScrollTop: workspace.scrollTop,
          wrapperScrollTop: wrapper.scrollTop,
          mainRange: main.scrollHeight - main.clientHeight,
          feedRange: feed.scrollHeight - feed.clientHeight,
          mainHorizontalRange: main.scrollWidth - main.clientWidth,
          feedHorizontalRange: feed.scrollWidth - feed.clientWidth,
          workspaceOverflow: getComputedStyle(workspace).overflowY,
          containerOverflow: getComputedStyle(container).overflow,
          wrapperOverflow: getComputedStyle(wrapper).overflow,
          mainOverflow: getComputedStyle(main).overflowY,
          feedOverflow: getComputedStyle(feed).overflowY,
          mainScrollbar: getComputedStyle(main).scrollbarWidth,
          feedScrollbar: getComputedStyle(feed).scrollbarWidth,
          composerVisible:
            composerRect.top >= panelRect.top - 0.5 &&
            composerRect.bottom <= Math.min(panelRect.bottom, innerHeight) + 0.5,
          headingVisible:
            headingRect.top >= topbarRect.bottom - 0.5 &&
            headingRect.bottom <= mainRect.top + 0.5,
          topbarVisible: topbarRect.top >= 0 && topbarRect.bottom <= innerHeight,
        };
      });

      expect(initial.documentScrollTop).toBe(0);
      expect(initial.workspaceScrollTop).toBe(0);
      expect(initial.wrapperScrollTop).toBe(0);
      expect(initial.workspaceOverflow).toBe("hidden");
      expect(initial.containerOverflow).toBe("hidden");
      expect(initial.wrapperOverflow).toBe("hidden");
      expect(initial.mainOverflow).toBe("auto");
      expect(initial.feedOverflow).toBe("auto");
      expect(initial.mainScrollbar).toBe("none");
      expect(initial.feedScrollbar).toBe("none");
      expect(initial.mainRange).toBeGreaterThan(0);
      expect(initial.feedRange).toBeGreaterThan(0);
      expect(initial.mainHorizontalRange).toBe(0);
      expect(initial.feedHorizontalRange).toBe(0);
      expect(initial.composerVisible).toBe(true);
      expect(initial.headingVisible).toBe(true);
      expect(initial.topbarVisible).toBe(true);
      expect(initial.dashboardHeight).toBeCloseTo(
        initial.containerContentHeight - initial.headingHeight - 16,
        0,
      );

      if (viewport.mode === "rail") {
        expect(initial.mainWidth).toBeGreaterThanOrEqual(679.5);
        expect(initial.updatesWidth).toBeGreaterThanOrEqual(339.5);
        expect(initial.updatesWidth).toBeLessThanOrEqual(400.5);
        expect(initial.gap).toBeGreaterThanOrEqual(23.5);
        expect(initial.gap).toBeLessThanOrEqual(24.5);
      } else {
        expect(initial.updatesWidth).toBeLessThanOrEqual(400.5);
      }

      if ("screenshot" in viewport) {
        await page.screenshot({
          path: resolve(EVIDENCE_DIR, viewport.screenshot),
          fullPage: false,
          animations: "disabled",
        });
      }

      if (viewport.mode === "drawer") {
        await page.getByRole("button", { name: "Close project updates" }).click();
        await expect(page.getByRole("dialog", { name: "Updates" })).toBeHidden();
      }

      const main = page.locator(".poc-left-column");
      await main.evaluate((node) => {
        node.scrollTop = 0;
      });
      await page.locator(".project-viewer-frame").hover();
      await page.mouse.wheel(0, 480);
      await expect.poll(() => main.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      const mainAfterGallery = await main.evaluate((node) => node.scrollTop);

      await main.evaluate((node) => {
        const overview = node.querySelector<HTMLElement>(".project-overview-section")!;
        node.scrollTop = Math.max(0, overview.offsetTop - node.clientHeight / 2);
      });
      const beforeOverview = await main.evaluate((node) => node.scrollTop);
      await page.locator(".project-overview-section").hover();
      await page.mouse.wheel(0, 320);
      await expect
        .poll(() => main.evaluate((node) => node.scrollTop))
        .toBeGreaterThan(beforeOverview);
      const mainAfterOverview = await main.evaluate((node) => node.scrollTop);

      if (viewport.mode === "drawer") {
        await page.getByRole("button", { name: "Updates", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Updates" })).toBeVisible();
      }

      const feed = page.locator(".poc-sections-card");
      await feed.evaluate((node) => {
        node.scrollTop = 0;
      });
      await feed.hover();
      await page.mouse.wheel(0, 420);
      await expect.poll(() => feed.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      const feedAfterUpdates = await feed.evaluate((node) => node.scrollTop);

      const final = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>(".workspace")!;
        const wrapper = document.querySelector<HTMLElement>(".poc-wrapper")!;
        const main = document.querySelector<HTMLElement>(".poc-left-column")!;
        const panel = document.querySelector<HTMLElement>(".poc-right-column")!;
        const composer = document.querySelector<HTMLElement>(
          "[data-updates-composer]",
        )!;
        const heading = document.querySelector<HTMLElement>(".page-heading")!;
        const topbar = document.querySelector<HTMLElement>(".topbar")!;
        const composerRect = composer.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const topbarRect = topbar.getBoundingClientRect();
        return {
          documentScrollTop: document.scrollingElement?.scrollTop ?? -1,
          workspaceScrollTop: workspace.scrollTop,
          wrapperScrollTop: wrapper.scrollTop,
          mainHorizontalRange: main.scrollWidth - main.clientWidth,
          feedHorizontalRange:
            document.querySelector<HTMLElement>(".poc-sections-card")!.scrollWidth -
            document.querySelector<HTMLElement>(".poc-sections-card")!.clientWidth,
          composerVisible:
            composerRect.top >= panelRect.top - 0.5 &&
            composerRect.bottom <= Math.min(panelRect.bottom, innerHeight) + 0.5,
          headingVisible:
            headingRect.top >= topbarRect.bottom - 0.5 &&
            headingRect.bottom <= main.getBoundingClientRect().top + 0.5,
          topbarVisible: topbarRect.top >= 0 && topbarRect.bottom <= innerHeight,
        };
      });

      expect(final.documentScrollTop).toBe(0);
      expect(final.workspaceScrollTop).toBe(0);
      expect(final.wrapperScrollTop).toBe(0);
      expect(final.mainHorizontalRange).toBe(0);
      expect(final.feedHorizontalRange).toBe(0);
      expect(final.composerVisible).toBe(true);
      expect(final.headingVisible).toBe(true);
      expect(final.topbarVisible).toBe(true);

      measurements.push({
        viewport: `${viewport.width}x${viewport.height}`,
        mode: viewport.mode,
        workspaceHeight: initial.workspaceHeight,
        headingHeight: initial.headingHeight,
        dashboardHeight: initial.dashboardHeight,
        mainHeight: initial.mainHeight,
        updatesHeight: initial.updatesHeight,
        feedHeight: initial.feedHeight,
        composerHeight: initial.composerHeight,
        mainWidth: initial.mainWidth,
        updatesWidth: initial.updatesWidth,
        gap: viewport.mode === "rail" ? initial.gap : 0,
        documentScrollTop: final.documentScrollTop,
        workspaceScrollTop: final.workspaceScrollTop,
        wrapperScrollTop: final.wrapperScrollTop,
        mainScrollTopAfterGallery: mainAfterGallery,
        mainScrollTopAfterOverview: mainAfterOverview,
        feedScrollTopAfterUpdates: feedAfterUpdates,
        mainHorizontalRange: final.mainHorizontalRange,
        feedHorizontalRange: final.feedHorizontalRange,
        composerVisible: final.composerVisible,
        headingVisible: final.headingVisible,
        topbarVisible: final.topbarVisible,
      });

      if ("screenshot" in viewport) {
        await page.screenshot({
          path: resolve(
            EVIDENCE_DIR,
            viewport.screenshot.replace(".png", "-active-scroll-regions.png"),
          ),
          fullPage: false,
          animations: "disabled",
        });
      }
    });
  }

  test("long project data and Odin transitions preserve the bounded scroll model", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openProject(page, "rail");
    await installLongFixtures(page);

    await page.evaluate(() => {
      document.querySelector<HTMLElement>(".title-with-share h1")!.textContent =
        "Nila Residence International Multi-Disciplinary Coordination Programme";
      document.querySelector<HTMLElement>(".post-content-text")!.textContent =
        `https://example.com/${"a".repeat(3000)}`;
      const value = document.querySelector<HTMLElement>(".stat-card-value");
      if (value) value.textContent = "Arjun Nair International Holdings and Development";
    });

    const textarea = page.getByLabel("Share a project update");
    const draft = await textarea.inputValue();
    await page.locator(".poc-sections-card").evaluate((feed) => {
      feed.scrollTop = 180;
    });

    await page.getByRole("button", { name: /^ask odin$/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute(
      "data-updates-mode",
      "drawer",
    );
    await page.getByRole("button", { name: "Updates", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Updates" })).toBeVisible();
    await expect(textarea).toHaveValue(draft);
    await expect(textarea).toBeInViewport();

    await page.getByRole("button", { name: "Close project updates" }).click();
    await page.getByRole("button", { name: /close assistant panel/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute(
      "data-updates-mode",
      "rail",
    );
    await expect(textarea).toHaveValue(draft);
    await expect(textarea).toBeInViewport();

    const containment = await page.evaluate(() => ({
      documentHorizontalRange:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      mainHorizontalRange:
        document.querySelector<HTMLElement>(".poc-left-column")!.scrollWidth -
        document.querySelector<HTMLElement>(".poc-left-column")!.clientWidth,
      feedHorizontalRange:
        document.querySelector<HTMLElement>(".poc-sections-card")!.scrollWidth -
        document.querySelector<HTMLElement>(".poc-sections-card")!.clientWidth,
    }));
    expect(containment).toEqual({
      documentHorizontalRange: 0,
      mainHorizontalRange: 0,
      feedHorizontalRange: 0,
    });
  });
});
