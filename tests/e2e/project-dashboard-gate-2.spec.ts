import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const PROJECT_ROUTE = "/projects/proj-001";
const EVIDENCE_DIR = resolve(process.cwd(), "docs/audits/project-dashboard-responsive/gate-2");

const VIEWPORTS = [
  { width: 1920, height: 1080, mode: "rail", gallery: [440, 460], screenshot: "project-dashboard-1920x1080-rail.png" },
  { width: 1536, height: 864, mode: "rail", gallery: [370, 385] },
  { width: 1440, height: 900, mode: "rail", gallery: [360, 380], screenshot: "project-dashboard-1440x900-rail.png" },
  { width: 1366, height: 768, mode: "rail", gallery: [328, 344] },
  { width: 1280, height: 720, mode: "rail", gallery: [304, 320], screenshot: "project-dashboard-1280x720-rail.png" },
  { width: 1200, height: 800, mode: "rail", gallery: [340, 356], screenshot: "project-dashboard-1200x800-rail.png" },
  { width: 1199, height: 800, mode: "drawer", gallery: [340, 356], screenshot: "project-dashboard-1199x800-drawer-closed.png" },
  { width: 1100, height: 800, mode: "drawer", gallery: [340, 356], screenshot: "project-dashboard-1100x800-drawer-open.png", openDrawer: true },
  { width: 1024, height: 768, mode: "drawer", gallery: [326, 342], screenshot: "project-dashboard-1024x768-drawer-open.png", openDrawer: true },
] as const;

interface Gate2Measurement {
  viewport: string;
  mode: "rail" | "drawer";
  mainWidth: number;
  updatesWidth: number;
  galleryWidth: number;
  galleryHeight: number;
  statsColumns: number;
  statsHorizontalRange: number;
  feedHorizontalRange: number;
  headingHeight: number;
  actionsTop: number;
}

const measurements: Gate2Measurement[] = [];

async function openProject(page: Page, mode: "rail" | "drawer") {
  await page.goto(PROJECT_ROUTE);
  await expect(page.locator(".poc-left-column")).toBeVisible();
  await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", mode);
  await expect.poll(() => page.locator(".project-viewer-img").evaluate((node) => {
    const image = node as HTMLImageElement;
    return image.complete && image.naturalWidth > 0;
  })).toBe(true);
  await page.locator(".project-viewer-img").evaluate((node) => (node as HTMLImageElement).decode());
}

async function setRenderedUpdateCount(page: Page, count: number) {
  await page.evaluate((targetCount) => {
    const feed = document.querySelector<HTMLElement>(".poc-sections-card");
    if (!feed) throw new Error("Updates feed not rendered");
    const cards = Array.from(feed.querySelectorAll<HTMLElement>(".post-item-card"));
    if (targetCount === 0) {
      cards.forEach((card) => card.remove());
    } else {
      const source = cards[0];
      if (!source) throw new Error("Default update fixture unavailable");
      while (feed.querySelectorAll(".post-item-card").length < targetCount) {
        const clone = source.cloneNode(true) as HTMLElement;
        clone.dataset.testClone = String(feed.querySelectorAll(".post-item-card").length + 1);
        feed.append(clone);
      }
    }
    feed.dataset.updateCount = String(targetCount);
  }, count);
}

test.describe("project dashboard Gate 2 responsive correction", () => {
  test.afterAll(() => {
    mkdirSync(EVIDENCE_DIR, { recursive: true });
    writeFileSync(
      resolve(EVIDENCE_DIR, "project-dashboard-gate-2-measurements.json"),
      `${JSON.stringify(measurements, null, 2)}\n`,
      "utf8",
    );
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} satisfies gallery, statistics, heading, and single-panel contracts`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openProject(page, viewport.mode);

      if ("openDrawer" in viewport && viewport.openDrawer) {
        await page.getByRole("button", { name: "Updates", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Updates" })).toBeVisible();
        await page.waitForTimeout(550);
      }

      const geometry = await page.evaluate(() => {
        const wrapper = document.querySelector<HTMLElement>(".poc-wrapper")!;
        const main = document.querySelector<HTMLElement>(".poc-left-column")!;
        const panel = document.querySelector<HTMLElement>(".poc-right-column")!;
        const gallery = document.querySelector<HTMLElement>(".project-viewer-frame")!;
        const image = document.querySelector<HTMLElement>(".project-viewer-img")!;
        const statsContainer = document.querySelector<HTMLElement>(".project-stat-cards-container")!;
        const stats = document.querySelector<HTMLElement>(".project-stat-cards-bar")!;
        const feed = document.querySelector<HTMLElement>(".poc-sections-card")!;
        const heading = document.querySelector<HTMLElement>(".page-heading")!;
        const actions = document.querySelector<HTMLElement>(".project-dashboard-title-actions")!;
        const panelRect = panel.getBoundingClientRect();
        const galleryRect = gallery.getBoundingClientRect();
        const actionRect = actions.getBoundingClientRect();
        return {
          mode: wrapper.dataset.updatesMode as "rail" | "drawer",
          documentHorizontalRange: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          mainWidth: main.getBoundingClientRect().width,
          mainVerticalRange: main.scrollHeight - main.clientHeight,
          mainHorizontalRange: main.scrollWidth - main.clientWidth,
          updatesWidth: panelRect.width,
          updatesPosition: getComputedStyle(panel).position,
          panelDisplay: getComputedStyle(panel).display,
          panelBottom: panelRect.bottom,
          panelRight: panelRect.right,
          galleryWidth: galleryRect.width,
          galleryHeight: galleryRect.height,
          previewFit: getComputedStyle(image).objectFit,
          statsColumns: getComputedStyle(stats).gridTemplateColumns.trim().split(/\s+/).length,
          statsHorizontalRange: statsContainer.scrollWidth - statsContainer.clientWidth,
          feedHorizontalRange: feed.scrollWidth - feed.clientWidth,
          feedOverflowY: getComputedStyle(feed).overflowY,
          headingHeight: heading.getBoundingClientRect().height,
          actionsTop: actionRect.top,
          actionsRight: actionRect.right,
          panelCount: document.querySelectorAll("[data-updates-presentation]").length,
          composerCount: document.querySelectorAll("[data-updates-composer]").length,
        };
      });

      expect(geometry.documentHorizontalRange).toBe(0);
      expect(geometry.mainVerticalRange).toBeGreaterThanOrEqual(0);
      expect(geometry.mainHorizontalRange).toBe(0);
      expect(geometry.feedHorizontalRange).toBe(0);
      expect(geometry.statsHorizontalRange).toBe(0);
      expect(geometry.galleryHeight).toBeGreaterThanOrEqual(viewport.gallery[0]);
      expect(geometry.galleryHeight).toBeLessThanOrEqual(viewport.gallery[1]);
      expect(geometry.previewFit).toBe("cover");
      expect(geometry.statsColumns).toBe(5);
      expect(geometry.actionsRight).toBeLessThanOrEqual(viewport.width + 0.5);
      expect(geometry.panelCount).toBe(1);
      expect(geometry.composerCount).toBe(1);

      if (viewport.mode === "rail") {
        expect(geometry.mainWidth).toBeGreaterThanOrEqual(679.5);
        expect(geometry.updatesWidth).toBeGreaterThanOrEqual(339.5);
        expect(geometry.updatesWidth).toBeLessThanOrEqual(400.5);
        expect(geometry.updatesPosition).toBe("static");
        expect(geometry.feedOverflowY).toBe("auto");
      } else if ("openDrawer" in viewport && viewport.openDrawer) {
        expect(geometry.updatesPosition).toBe("fixed");
        expect(geometry.updatesWidth).toBeLessThanOrEqual(400.5);
        expect(geometry.panelRight).toBeLessThanOrEqual(viewport.width - 15.5);
        expect(geometry.panelBottom).toBeLessThanOrEqual(viewport.height - 15.5);
      } else {
        expect(geometry.panelDisplay).toBe("none");
      }

      measurements.push({
        viewport: `${viewport.width}x${viewport.height}`,
        mode: geometry.mode,
        mainWidth: geometry.mainWidth,
        updatesWidth: viewport.mode === "rail" || ("openDrawer" in viewport && viewport.openDrawer) ? geometry.updatesWidth : 0,
        galleryWidth: geometry.galleryWidth,
        galleryHeight: geometry.galleryHeight,
        statsColumns: geometry.statsColumns,
        statsHorizontalRange: geometry.statsHorizontalRange,
        feedHorizontalRange: geometry.feedHorizontalRange,
        headingHeight: geometry.headingHeight,
        actionsTop: geometry.actionsTop,
      });

      if ("screenshot" in viewport) {
        mkdirSync(EVIDENCE_DIR, { recursive: true });
        await page.screenshot({ path: resolve(EVIDENCE_DIR, viewport.screenshot), fullPage: false });
      }
    });
  }

  test("0, 3, and 12 updates retain bounded feed and composer geometry", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    for (const count of [0, 3, 12]) {
      await openProject(page, "rail");
      await setRenderedUpdateCount(page, count);
      const geometry = await page.evaluate(() => {
        const panel = document.querySelector<HTMLElement>(".poc-right-column")!;
        const feed = document.querySelector<HTMLElement>(".poc-sections-card")!;
        const composer = document.querySelector<HTMLElement>("[data-updates-composer]")!;
        const panelRect = panel.getBoundingClientRect();
        const feedRect = feed.getBoundingClientRect();
        const composerRect = composer.getBoundingClientRect();
        const workspace = document.querySelector<HTMLElement>(".workspace")!;
        return {
          feedHeight: feedRect.height,
          feedRange: feed.scrollHeight - feed.clientHeight,
          feedOverflowY: getComputedStyle(feed).overflowY,
          workspaceRange: workspace.scrollHeight - workspace.clientHeight,
          feedHorizontalRange: feed.scrollWidth - feed.clientWidth,
          composerHeight: composerRect.height,
          composerInsidePanel: composerRect.bottom <= panelRect.bottom + 0.5,
          composerCount: document.querySelectorAll("[data-updates-composer]").length,
          panelCount: document.querySelectorAll("[data-updates-presentation]").length,
        };
      });
      expect(geometry.feedHeight).toBeGreaterThan(100);
      expect(geometry.feedHorizontalRange).toBe(0);
      expect(geometry.composerHeight).toBeGreaterThan(70);
      expect(geometry.composerInsidePanel).toBe(true);
      expect(geometry.composerCount).toBe(1);
      expect(geometry.panelCount).toBe(1);
      expect(geometry.feedOverflowY).toBe("auto");
      expect(geometry.workspaceRange).toBe(0);
      if (count === 12) expect(geometry.feedRange).toBeGreaterThan(0);

      if (count === 12) {
        await page.screenshot({ path: resolve(EVIDENCE_DIR, "project-dashboard-1280x720-twelve-updates.png"), fullPage: false });
      }
    }

    await openProject(page, "rail");
    const workspace = page.locator(".workspace");
    const before = await workspace.evaluate((node) => node.scrollTop);
    await page.locator("[data-updates-composer]").hover();
    await page.mouse.wheel(0, 500);
    expect(await workspace.evaluate((node) => node.scrollTop)).toBe(before);
  });

  test("rail and drawer transitions preserve the exact draft and feed state in one mounted panel", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openProject(page, "rail");
    await setRenderedUpdateCount(page, 12);
    const textarea = page.getByLabel("Share a project update");
    const draft = "Draft retained from rail through the 1199 drawer boundary";
    await textarea.fill(draft);
    expect(await page.locator(".poc-sections-card").evaluate((feed) => feed.scrollHeight - feed.clientHeight)).toBeGreaterThan(0);
    await page.locator(".poc-sections-card").evaluate((feed) => { feed.scrollTop = 180; });

    await page.setViewportSize({ width: 1199, height: 800 });
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "drawer");
    const trigger = page.getByRole("button", { name: "Updates", exact: true });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Updates" })).toBeVisible();
    await expect(textarea).toHaveValue(draft);
    expect(await page.locator(".poc-sections-card").evaluate((feed) => feed.scrollTop)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Close project updates" }).click();
    await trigger.click();
    expect(await page.locator(".poc-sections-card").evaluate((feed) => feed.scrollTop)).toBeGreaterThan(0);
    expect(await page.locator("[data-updates-composer]").count()).toBe(1);
    expect(await page.locator("[data-updates-presentation]").count()).toBe(1);
    await page.screenshot({ path: resolve(EVIDENCE_DIR, "project-dashboard-rail-to-drawer-draft-persistence.png"), fullPage: false });

    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "rail");
    await expect(textarea).toHaveValue(draft);
    await expect(page.getByRole("complementary", { name: "Project updates" })).toBeVisible();
    expect(await page.locator(".poc-sections-card").evaluate((feed) => feed.scrollHeight - feed.clientHeight)).toBeGreaterThan(0);
  });

  test("drawer traps focus, closes with Escape, restores the exact trigger, and locks background scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await openProject(page, "drawer");
    const trigger = page.getByRole("button", { name: "Updates", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Updates" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close project updates" })).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

    await page.keyboard.press("Shift+Tab");
    expect(await page.evaluate(() => document.querySelector("[role='dialog']")?.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.querySelector("[role='dialog']")?.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("Odin capacity changes preserve a rail draft while Updates becomes a drawer", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openProject(page, "rail");
    const draft = "Draft survives Odin capacity transition";
    await page.getByLabel("Share a project update").fill(draft);
    await page.getByRole("button", { name: /^ask odin$/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "drawer");
    await expect(page.getByLabel("Share a project update")).toHaveValue(draft);
    await page.screenshot({ path: resolve(EVIDENCE_DIR, "project-dashboard-odin-open-capacity-transition.png"), fullPage: false });
    await page.getByRole("button", { name: /close assistant panel/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "rail");
    await expect(page.getByLabel("Share a project update")).toHaveValue(draft);
  });

  test("statistics respond to their own container and long values stay contained", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openProject(page, "rail");
    const expected = [[700, 5], [600, 3], [400, 2], [280, 1]] as const;
    for (const [width, columns] of expected) {
      const result = await page.locator(".project-stat-cards-container").evaluate((node, targetWidth) => {
        const container = node as HTMLElement;
        container.style.width = `${targetWidth}px`;
        const grid = container.querySelector<HTMLElement>(".project-stat-cards-bar")!;
        return new Promise<{ columns: number; range: number }>((resolveResult) => requestAnimationFrame(() => resolveResult({
          columns: getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,
          range: container.scrollWidth - container.clientWidth,
        })));
      }, width);
      expect(result.columns).toBe(columns);
      expect(result.range).toBe(0);
    }

    await page.evaluate(() => {
      const values = document.querySelectorAll<HTMLElement>(".horiz-stat-value");
      values[2]!.textContent = "125,750 sq ft";
      values[3]!.textContent = "₹12,345,678,900 approved budget";
      values[4]!.textContent = "Arjun Nair and the Nila Residence Family Development Trust";
      const container = document.querySelector<HTMLElement>(".project-stat-cards-container")!;
      container.style.width = "";
      document.querySelector<HTMLElement>(".page-heading h1")!.textContent = "Nila Residence Multi-generational Sustainable Courtyard Redevelopment and Interior Coordination Programme";
      document.querySelector<HTMLElement>(".breadcrumb-current")!.textContent = "Nila Residence Multi-generational Sustainable Courtyard Redevelopment";
    });

    const resilience = await page.evaluate(() => {
      const headingTitle = document.querySelector<HTMLElement>(".page-heading-title")!.getBoundingClientRect();
      const actions = document.querySelector<HTMLElement>(".project-dashboard-title-actions")!.getBoundingClientRect();
      const stats = document.querySelector<HTMLElement>(".project-stat-cards-container")!;
      return {
        documentRange: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        statsRange: stats.scrollWidth - stats.clientWidth,
        overlaps: !(headingTitle.right <= actions.left || actions.right <= headingTitle.left || headingTitle.bottom <= actions.top || actions.bottom <= headingTitle.top),
        actionsRight: actions.right,
      };
    });
    expect(resilience.documentRange).toBe(0);
    expect(resilience.statsRange).toBe(0);
    expect(resilience.overlaps).toBe(false);
    expect(resilience.actionsRight).toBeLessThanOrEqual(1280.5);
    await page.screenshot({ path: resolve(EVIDENCE_DIR, "project-dashboard-1280x720-long-values.png"), fullPage: false });
  });

  test("portrait and wide update media crop without distortion, while fullscreen gallery contains", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openProject(page, "rail");
    const media = page.locator(".post-media-img").first();

    for (const source of [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='800'%3E%3Crect width='400' height='800' fill='%2364748b'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='400'%3E%3Crect width='1600' height='400' fill='%23334155'/%3E%3C/svg%3E",
    ]) {
      await media.evaluate((node, src) => {
        const image = node as HTMLImageElement;
        image.removeAttribute("srcset");
        image.src = src;
      }, source);
      await expect.poll(() => media.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect(await media.evaluate((node) => getComputedStyle(node).objectFit)).toBe("cover");
    }

    await page.getByRole("button", { name: "Fullscreen" }).click();
    await expect(page.locator(".project-gallery-viewer.is-fullscreen")).toBeVisible();
    expect(await page.locator(".project-viewer-img").evaluate((node) => getComputedStyle(node).objectFit)).toBe("contain");
  });

  test("expanded overview and a future section remain reachable through the main project column", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await openProject(page, "drawer");
    await expect(page.getByRole("button", { name: /project overview/i })).toHaveAttribute("aria-expanded", "true");
    await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>(".poc-left-column")!;
      const sentinel = document.createElement("section");
      sentinel.dataset.testid = "gate-2-future-section";
      sentinel.style.minHeight = "720px";
      sentinel.textContent = "Future project section sentinel";
      main.append(sentinel);
    });
    const sentinel = page.locator("[data-testid='gate-2-future-section']");
    await page.locator(".poc-left-column").evaluate((main) => {
      main.scrollTop = main.scrollHeight;
    });
    await expect(sentinel).toBeInViewport();
    expect(await page.locator(".workspace").evaluate((node) => node.scrollTop)).toBe(0);
    expect(await page.locator(".poc-left-column").evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  });

  test("captures unobstructed gallery comparison crops for every approved viewport", async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openProject(page, viewport.mode);
      await page.locator(".project-viewer-frame").screenshot({
        path: resolve(EVIDENCE_DIR, `gallery-${viewport.width}x${viewport.height}.png`),
        animations: "disabled",
      });
    }
  });
});
