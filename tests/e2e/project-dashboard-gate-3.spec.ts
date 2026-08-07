import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const PROJECT_ROUTE = "/projects/proj-001";
const EVIDENCE_DIR = resolve(
  process.cwd(),
  "docs/audits/project-dashboard-responsive/gate-3",
);

const VIEWPORTS = [
  { width: 1920, height: 1080, mode: "rail", screenshot: "project-dashboard-1920x1080-final-rail.png" },
  { width: 1536, height: 864, mode: "rail" },
  { width: 1440, height: 900, mode: "rail", screenshot: "project-dashboard-1440x900-final-rail.png" },
  { width: 1366, height: 768, mode: "rail" },
  { width: 1280, height: 720, mode: "rail", screenshot: "project-dashboard-1280x720-final-rail.png" },
  { width: 1200, height: 800, mode: "rail", screenshot: "project-dashboard-1200x800-final-rail.png" },
  { width: 1199, height: 800, mode: "drawer", screenshot: "project-dashboard-1199x800-drawer-closed.png" },
  { width: 1100, height: 800, mode: "drawer", screenshot: "project-dashboard-1100x800-drawer-open.png", openDrawer: true },
  { width: 1024, height: 768, mode: "drawer", screenshot: "project-dashboard-1024x768-drawer-open.png", openDrawer: true },
] as const;

interface Gate3Measurement {
  viewport: string;
  mode: "rail" | "drawer";
  mainWidth: number;
  updatesWidth: number;
  galleryWidth: number;
  galleryHeight: number;
  documentHorizontalRange: number;
  feedHorizontalRange: number;
  statsHorizontalRange: number;
  composerHeight: number;
  feedHeight: number;
  dashboardHeight: number;
  headingHeight: number;
  mainHeight: number;
  mainVerticalRange: number;
  feedVerticalRange: number;
  documentScrollTop: number;
  workspaceScrollTop: number;
  wrapperScrollTop: number;
  composerVisible: boolean;
}

const measurements: Gate3Measurement[] = [];

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
}

test.describe("project dashboard Gate 3 final hardening", () => {
  test.beforeAll(() => mkdirSync(EVIDENCE_DIR, { recursive: true }));

  test.afterAll(() => {
    writeFileSync(
      resolve(EVIDENCE_DIR, "project-dashboard-gate-3-measurements.json"),
      `${JSON.stringify(measurements, null, 2)}\n`,
      "utf8",
    );
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} preserves all approved layout contracts`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openProject(page, viewport.mode);

      if ("openDrawer" in viewport && viewport.openDrawer) {
        await page.getByRole("button", { name: "Updates", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Updates" })).toBeVisible();
      }

      const geometry = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>(".workspace")!;
        const wrapper = document.querySelector<HTMLElement>(".poc-wrapper")!;
        const heading = document.querySelector<HTMLElement>(".page-heading")!;
        const main = document.querySelector<HTMLElement>(".poc-left-column")!;
        const panel = document.querySelector<HTMLElement>(".poc-right-column")!;
        const gallery = document.querySelector<HTMLElement>(".project-viewer-frame")!;
        const feed = document.querySelector<HTMLElement>(".poc-sections-card")!;
        const stats = document.querySelector<HTMLElement>(".project-stat-cards-container")!;
        const composer = document.querySelector<HTMLElement>("[data-updates-composer]")!;
        const panelRect = panel.getBoundingClientRect();
        const composerRect = composer.getBoundingClientRect();
        return {
          mode: document.querySelector<HTMLElement>(".poc-wrapper")!.dataset
            .updatesMode as "rail" | "drawer",
          mainWidth: main.getBoundingClientRect().width,
          mainHorizontalRange: main.scrollWidth - main.clientWidth,
          mainVerticalRange: main.scrollHeight - main.clientHeight,
          mainOverflowY: getComputedStyle(main).overflowY,
          mainHeight: main.getBoundingClientRect().height,
          updatesWidth: panelRect.width,
          panelDisplay: getComputedStyle(panel).display,
          galleryWidth: gallery.getBoundingClientRect().width,
          galleryHeight: gallery.getBoundingClientRect().height,
          documentHorizontalRange:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          documentScrollTop: document.scrollingElement?.scrollTop ?? -1,
          workspaceScrollTop: workspace.scrollTop,
          wrapperScrollTop: wrapper.scrollTop,
          dashboardHeight: wrapper.getBoundingClientRect().height,
          headingHeight: heading.getBoundingClientRect().height,
          feedHorizontalRange: feed.scrollWidth - feed.clientWidth,
          feedScrollbarWidth: getComputedStyle(feed).scrollbarWidth,
          feedVerticalRange: feed.scrollHeight - feed.clientHeight,
          statsHorizontalRange: stats.scrollWidth - stats.clientWidth,
          composerHeight: composerRect.height,
          composerInsidePanel: composerRect.bottom <= panelRect.bottom + 0.5,
          composerVisible:
            composerRect.top >= panelRect.top - 0.5 &&
            composerRect.bottom <= Math.min(panelRect.bottom, window.innerHeight) + 0.5,
          feedHeight: feed.getBoundingClientRect().height,
          panelCount: document.querySelectorAll("[data-updates-presentation]").length,
          composerCount: document.querySelectorAll("[data-updates-composer]").length,
        };
      });

      expect(geometry.documentHorizontalRange).toBe(0);
      expect(geometry.documentScrollTop).toBe(0);
      expect(geometry.workspaceScrollTop).toBe(0);
      expect(geometry.wrapperScrollTop).toBe(0);
      expect(geometry.mainHorizontalRange).toBe(0);
      expect(geometry.mainVerticalRange).toBeGreaterThanOrEqual(0);
      expect(geometry.mainOverflowY).toBe("auto");
      expect(geometry.feedHorizontalRange).toBe(0);
      expect(geometry.feedScrollbarWidth).toBe("none");
      expect(geometry.statsHorizontalRange).toBe(0);
      expect(geometry.galleryHeight).toBeGreaterThanOrEqual(279.5);
      expect(geometry.galleryHeight).toBeLessThanOrEqual(460.5);
      expect(geometry.panelCount).toBe(1);
      expect(geometry.composerCount).toBe(1);

      if (viewport.mode === "rail") {
        expect(geometry.mainWidth).toBeGreaterThanOrEqual(679.5);
        expect(geometry.updatesWidth).toBeGreaterThanOrEqual(339.5);
        expect(geometry.updatesWidth).toBeLessThanOrEqual(400.5);
        expect(geometry.composerInsidePanel).toBe(true);
        expect(geometry.composerVisible).toBe(true);
        expect(geometry.feedHeight).toBeGreaterThanOrEqual(127.5);
        expect(
          await page.locator(".poc-sections-card").evaluate((feed) => ({
            overflowY: getComputedStyle(feed).overflowY,
            verticalRange: feed.scrollHeight - feed.clientHeight,
          })),
        ).toEqual({
          overflowY: "auto",
          verticalRange: geometry.feedVerticalRange,
        });
      } else if (!("openDrawer" in viewport)) {
        expect(geometry.panelDisplay).toBe("none");
      } else {
        expect(geometry.composerInsidePanel).toBe(true);
        expect(geometry.composerVisible).toBe(true);
        expect(geometry.feedHeight).toBeGreaterThanOrEqual(127.5);
      }

      measurements.push({
        viewport: `${viewport.width}x${viewport.height}`,
        mode: geometry.mode,
        mainWidth: geometry.mainWidth,
        updatesWidth:
          viewport.mode === "rail" || "openDrawer" in viewport
            ? geometry.updatesWidth
            : 0,
        galleryWidth: geometry.galleryWidth,
        galleryHeight: geometry.galleryHeight,
        documentHorizontalRange: geometry.documentHorizontalRange,
        feedHorizontalRange: geometry.feedHorizontalRange,
        statsHorizontalRange: geometry.statsHorizontalRange,
        composerHeight: geometry.composerHeight,
        feedHeight: geometry.feedHeight,
        dashboardHeight: geometry.dashboardHeight,
        headingHeight: geometry.headingHeight,
        mainHeight: geometry.mainHeight,
        mainVerticalRange: geometry.mainVerticalRange,
        feedVerticalRange: geometry.feedVerticalRange,
        documentScrollTop: geometry.documentScrollTop,
        workspaceScrollTop: geometry.workspaceScrollTop,
        wrapperScrollTop: geometry.wrapperScrollTop,
        composerVisible: geometry.composerVisible,
      });

      await page
        .locator(".project-viewer-frame")
        .screenshot({
          path: resolve(
            EVIDENCE_DIR,
            `gallery-final-${viewport.width}x${viewport.height}.png`,
          ),
          animations: "disabled",
        });

      if ("screenshot" in viewport) {
        await page.screenshot({
          path: resolve(EVIDENCE_DIR, viewport.screenshot),
          fullPage: false,
          animations: "disabled",
        });
      }
    });
  }

  test("composer grows for one, two, four, six, and ten lines and preserves height through every transition", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openProject(page, "rail");
    const textarea = page.getByLabel("Share a project update");
    const lineCounts = [1, 2, 4, 6, 10] as const;
    const heights: number[] = [];

    for (const count of lineCounts) {
      const draft = Array.from({ length: count }, (_, index) => `Line ${index + 1} coordination note`).join("\n");
      await textarea.fill(draft);
      const geometry = await textarea.evaluate((node) => ({
        height: node.getBoundingClientRect().height,
        scrollHeight: node.scrollHeight,
        clientHeight: node.clientHeight,
        overflowX: getComputedStyle(node).overflowX,
        overflowY: getComputedStyle(node).overflowY,
      }));
      heights.push(geometry.height);
      expect(geometry.height).toBeGreaterThanOrEqual(47.5);
      expect(geometry.height).toBeLessThanOrEqual(144.5);
      expect(geometry.overflowX).toBe("hidden");
      if (count === 10) {
        expect(geometry.height).toBeGreaterThanOrEqual(143.5);
        expect(geometry.overflowY).toBe("auto");
        expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
        await page.screenshot({
          path: resolve(EVIDENCE_DIR, "project-dashboard-ten-line-composer-maximum.png"),
          fullPage: false,
        });
      }
      if (count === 4) {
        await page.screenshot({
          path: resolve(EVIDENCE_DIR, "project-dashboard-four-line-composer.png"),
          fullPage: false,
        });
      }
    }

    expect(heights[0]).toBeLessThanOrEqual(heights[2]!);
    expect(heights[2]).toBeLessThanOrEqual(heights[4]!);
    const tenLineDraft = await textarea.inputValue();
    const maxHeight = await textarea.evaluate((node) => node.getBoundingClientRect().height);

    await page.setViewportSize({ width: 1199, height: 800 });
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "drawer");
    await page.getByRole("button", { name: "Updates", exact: true }).click();
    await expect(textarea).toHaveValue(tenLineDraft);
    expect(await textarea.evaluate((node) => node.getBoundingClientRect().height)).toBeCloseTo(maxHeight, 0);
    await page.getByRole("button", { name: "Close project updates" }).click();
    await page.getByRole("button", { name: "Updates", exact: true }).click();
    expect(await textarea.evaluate((node) => node.getBoundingClientRect().height)).toBeCloseTo(maxHeight, 0);

    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "rail");
    await expect(textarea).toHaveValue(tenLineDraft);
    expect(await textarea.evaluate((node) => node.getBoundingClientRect().height)).toBeCloseTo(maxHeight, 0);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("button", { name: /^ask odin$/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "drawer");
    await expect(textarea).toHaveValue(tenLineDraft);
    expect(await textarea.evaluate((node) => node.style.height)).toBe("144px");
    await page.getByRole("button", { name: /close assistant panel/i }).click();
    await expect(page.locator(".poc-wrapper")).toHaveAttribute("data-updates-mode", "rail");
  });

  test("extreme update content, paragraphs, labels, and media remain contained", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openProject(page, "rail");
    await page.evaluate(() => {
      const token = "https://example.com/" + "x".repeat(3000);
      document.querySelector<HTMLElement>(".post-content-text")!.textContent = token;
      document.querySelector<HTMLElement>(".post-author-name")!.textContent = "User" + "N".repeat(500);
      document.querySelector<HTMLElement>(".post-role-text")!.textContent = "Role" + "R".repeat(500);
      document.querySelector<HTMLElement>(".milestone-badge-tag span:last-child")!.textContent = "Action" + "A".repeat(500);
      document.querySelector<HTMLElement>(".post-action-btn span")!.textContent = "Reply" + "L".repeat(500);
    });

    const containment = await page.evaluate(() => {
      const feed = document.querySelector<HTMLElement>(".poc-sections-card")!;
      const post = document.querySelector<HTMLElement>(".post-content-text")!;
      return {
        documentRange: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        feedRange: feed.scrollWidth - feed.clientWidth,
        postWrap: getComputedStyle(post).overflowWrap,
        postWordBreak: getComputedStyle(post).wordBreak,
        postOverflow: getComputedStyle(post).overflow,
      };
    });
    expect(containment.documentRange).toBe(0);
    expect(containment.feedRange).toBe(0);
    expect(containment.postWrap).toBe("anywhere");
    expect(containment.postWordBreak).toBe("normal");
    expect(containment.postOverflow).toBe("visible");
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, "project-dashboard-long-unbroken-update.png"),
      fullPage: false,
    });

    await page.evaluate(() => {
      document.querySelector<HTMLElement>(".post-content-text")!.textContent =
        "First readable project paragraph with a normal sentence.\n\nSecond paragraph retains normal wrapping and selection.\n\nThird paragraph records the next site action.";
    });
    expect(
      await page.locator(".post-content-text").first().evaluate((node) => getComputedStyle(node).whiteSpace),
    ).toBe("normal");

    const media = page.locator(".post-media-img").first();
    for (const source of [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='1000'%3E%3Crect width='400' height='1000' fill='%2364748b'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1800' height='300'%3E%3Crect width='1800' height='300' fill='%23334155'/%3E%3C/svg%3E",
    ]) {
      await media.evaluate((node, src) => {
        const image = node as HTMLImageElement;
        image.removeAttribute("srcset");
        image.src = src;
      }, source);
      await expect.poll(() => media.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect(await media.evaluate((node) => getComputedStyle(node).objectFit)).toBe("cover");
    }
  });

  test("long breadcrumbs collapse into a keyboard menu without top-bar overlap", async ({ page }) => {
    for (const width of [1440, 1280, 1200, 1199, 1024]) {
      await page.setViewportSize({ width, height: 800 });
      await openProject(page, width >= 1200 ? "rail" : "drawer");
      await page.evaluate(() => {
        const label = "Nila Residence International Multi Generational Sustainable Redevelopment Programme";
        const nav = document.querySelector<HTMLElement>(".topbar-breadcrumbs")!;
        nav.style.maxWidth = "250px";
        document.querySelectorAll<HTMLElement>(".breadcrumb-current").forEach((node) => {
          node.textContent = label;
        });
      });
      const trigger = page.getByRole("button", { name: "Show hidden breadcrumb items" });
      await expect(trigger).toBeVisible();
      const overlap = await page.evaluate(() => {
        const breadcrumb = document.querySelector<HTMLElement>(".topbar-breadcrumbs")!.getBoundingClientRect();
        const search = document.querySelector<HTMLElement>(".global-search-pill")!.getBoundingClientRect();
        const actions = document.querySelector<HTMLElement>(".topbar-actions")!.getBoundingClientRect();
        const overlaps = (a: DOMRect, b: DOMRect) =>
          !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
        return {
          search: getComputedStyle(document.querySelector<HTMLElement>(".global-search-pill")!).display === "none" ? false : overlaps(breadcrumb, search),
          actions: overlaps(breadcrumb, actions),
          documentRange: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(overlap.search).toBe(false);
      expect(overlap.actions).toBe(false);
      expect(overlap.documentRange).toBe(0);
    }

    const trigger = page.getByRole("button", { name: "Show hidden breadcrumb items" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu", { name: "Hidden breadcrumb items" })).toBeVisible();
    await expect(page.getByRole("menuitem").first()).toBeFocused();
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, "project-dashboard-long-breadcrumb-menu-open.png"),
      fullPage: false,
    });
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByRole("menu", { name: "Hidden breadcrumb items" })).toBeVisible();
    await page.mouse.click(800, 700);
    await expect(page.getByRole("menu", { name: "Hidden breadcrumb items" })).toBeHidden();
  });

  test("sidebar disclosures contain long labels and expose the workspace tooltip only on actual overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openProject(page, "rail");
    const selector = page.getByRole("button", { name: /switch workspace/i });
    await page.locator(".workspace-meta strong").evaluate((node) => {
      (node as HTMLElement).style.width = "44px";
      (node as HTMLElement).style.maxWidth = "44px";
      (node as HTMLElement).style.display = "block";
      window.dispatchEvent(new Event("resize"));
    });
    await expect(page.locator(".sidebar-overflow-tooltip")).toBeAttached();
    await page.evaluate(() => {
      const longWorkspace = "Arjun Architects International Multi Studio Coordination Workspace";
      document.querySelector<HTMLElement>(".workspace-meta strong")!.textContent = longWorkspace;
      document.querySelector<HTMLElement>(".sidebar-overflow-tooltip")!.textContent = longWorkspace;
      document.querySelector<HTMLElement>(".nav-label")!.textContent =
        "Localized navigation label requiring containment inside the established row";
      document.querySelector<HTMLElement>(".invite-banner-text small")!.textContent =
        "Bring every international studio collaborator into this single coordinated workspace.";
    });
    await selector.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();

    const containment = await page.evaluate(() => {
      const row = document.querySelector<HTMLElement>(".nav-row")!;
      const label = row.querySelector<HTMLElement>(".nav-label")!;
      const invite = document.querySelector<HTMLElement>(".invite-banner-card")!;
      const inviteCopy = invite.querySelector<HTMLElement>(".invite-banner-text")!;
      const selector = document.querySelector<HTMLElement>(".workspace-selector-card")!;
      const labelRect = label.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const inviteRect = invite.getBoundingClientRect();
      const copyRect = inviteCopy.getBoundingClientRect();
      return {
        labelContained: labelRect.right <= rowRect.right + 0.5,
        inviteContained:
          copyRect.top >= inviteRect.top - 0.5 && copyRect.bottom <= inviteRect.bottom + 0.5,
        documentRange: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        selectorHeight: selector.getBoundingClientRect().height,
      };
    });
    expect(containment.labelContained).toBe(true);
    expect(containment.inviteContained).toBe(true);
    expect(containment.documentRange).toBe(0);
    expect(containment.selectorHeight).toBeGreaterThanOrEqual(39.5);
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, "project-dashboard-long-workspace-tooltip.png"),
      fullPage: false,
    });
  });

  test("hit areas, focus visibility, contrast, drawer focus containment, and reduced motion pass", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openProject(page, "drawer");
    await page.locator(".topbar-breadcrumbs").evaluate((node) => {
      (node as HTMLElement).style.maxWidth = "120px";
    });
    const updatesTrigger = page.getByRole("button", { name: "Updates", exact: true });
    await updatesTrigger.focus();
    await expect(updatesTrigger).toBeFocused();
    await updatesTrigger.click();
    const dialog = page.getByRole("dialog", { name: "Updates" });
    await expect(dialog).toBeVisible();

    const accessibility = await page.evaluate(() => {
      const selectors = [
        ".project-viewer-control-btn",
        ".project-updates-trigger",
        ".poc-updates-drawer-close",
        ".update-attach-btn",
        ".update-version-select",
        ".update-send-btn",
        ".post-more-btn",
        ".post-action-btn",
        ".title-share-btn",
        ".title-status-chip",
        ".breadcrumb-overflow-trigger",
      ];
      const targets = selectors.flatMap((selector) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector)),
      );
      const sizes = targets.map((element) => {
        const rect = element.getBoundingClientRect();
        return { selector: element.className, width: rect.width, height: rect.height };
      });
      const date = document.querySelector<HTMLElement>(".post-date")!;
      const surface = document.querySelector<HTMLElement>(".poc-right-column")!;
      const parseRgb = (value: string) =>
        value.match(/[\d.]+/g)!.slice(0, 3).map(Number) as [number, number, number];
      const luminance = ([red, green, blue]: [number, number, number]) => {
        const values = [red, green, blue].map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return values[0]! * 0.2126 + values[1]! * 0.7152 + values[2]! * 0.0722;
      };
      const foreground = luminance(parseRgb(getComputedStyle(date).color));
      const background = luminance(parseRgb(getComputedStyle(surface).backgroundColor));
      const contrast =
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05);
      const panel = document.querySelector<HTMLElement>(".poc-right-column")!;
      return {
        sizes,
        contrast,
        animationName: getComputedStyle(panel).animationName,
        animationDuration: getComputedStyle(panel).animationDuration,
        dialogLabel: panel.getAttribute("aria-labelledby"),
        modal: panel.getAttribute("aria-modal"),
      };
    });
    for (const size of accessibility.sizes) {
      expect(size.width).toBeGreaterThanOrEqual(39.5);
      expect(size.height).toBeGreaterThanOrEqual(39.5);
    }
    expect(accessibility.contrast).toBeGreaterThanOrEqual(4.5);
    expect(accessibility.animationName).toBe("none");
    expect(Number.parseFloat(accessibility.animationDuration)).toBeLessThanOrEqual(0.00001);
    expect(accessibility.dialogLabel).toBe("project-updates-title");
    expect(accessibility.modal).toBe("true");

    const textarea = page.getByLabel("Share a project update");
    await textarea.focus();
    const focusWithin = await page.locator(".update-input-card").evaluate((node) => ({
      borderColor: getComputedStyle(node).borderColor,
      boxShadow: getComputedStyle(node).boxShadow,
    }));
    expect(focusWithin.boxShadow).not.toBe("none");
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, "project-dashboard-reduced-motion-drawer.png"),
      fullPage: false,
    });
    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(updatesTrigger).toBeFocused();

    await updatesTrigger.focus();
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, "project-dashboard-keyboard-focus-states.png"),
      fullPage: false,
    });
  });
});
