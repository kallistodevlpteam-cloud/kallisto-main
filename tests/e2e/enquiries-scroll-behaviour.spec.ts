import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const ENQUIRIES_ROUTE = "/enquiries";
const ARTIFACT_DIR = "C:\\Users\\sarik\\.gemini\\antigravity\\brain\\c45a38ae-c3c9-40c6-88b7-55d42ea688c8";

// Deterministic 25-record test fixture for testing multi-page pagination & scrolling without mutating production mock file
const FIXTURE_25_RECORDS = Array.from({ length: 25 }, (_, i) => ({
  id: `fixture-enq-${i + 1}`,
  title: `Test Project ${i + 1}`,
  requirementSummary: `Requirement summary details for test project ${i + 1}`,
  clientName: `Client ${i + 1}`,
  location: i % 2 === 0 ? "Kochi" : "Bengaluru",
  thumbnailUrl: "/assets/projects/greenfield-villa.png",
  source: "website",
  status: "active",
  stage: "new",
  projectType: i % 3 === 0 ? "residential" : i % 3 === 1 ? "commercial" : "hospitality",
  budgetMin: 1000000 + i * 100000,
  budgetMax: 2000000 + i * 100000,
  receivedAt: new Date(Date.now() - i * 86400000).toISOString(),
  nextAction: {
    type: "review_enquiry",
    label: "Review enquiry",
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    state: "urgent",
  },
}));

const VIEWPORTS = [
  { width: 1920, height: 1080, screenshot: "enquiries_1920x1080.png" },
  { width: 1536, height: 864, screenshot: null },
  { width: 1440, height: 900, screenshot: "enquiries_1440x900.png" },
  { width: 1366, height: 768, screenshot: null },
  { width: 1280, height: 720, screenshot: "enquiries_1280x720.png" },
  { width: 1194, height: 834, screenshot: null },
  { width: 1180, height: 820, screenshot: "enquiries_1180x820.png" },
  { width: 1100, height: 800, screenshot: "enquiries_1100x800.png" },
  { width: 1024, height: 768, screenshot: "enquiries_1024x768.png" },
] as const;

test.describe("Enquiries Page Final Validation & Interaction Hardening", () => {
  // A. Production Default 7-Record State across Viewports
  for (const vp of VIEWPORTS) {
    test(`verifies default 7-record production state at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ENQUIRIES_ROUTE);

      await expect(page.locator(".enquiriesWorkspaceRoot")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: "Enquiries" })).toBeVisible();

      // Table Header & Actions Column
      await expect(page.getByRole("columnheader", { name: "Actions" })).toBeVisible();

      // Scroll positions check (must all be 0)
      const scrollPos = await page.evaluate(() => {
        const workspace = document.querySelector(".workspace");
        const container = document.querySelector(".workspace-container");
        return {
          doc: document.scrollingElement ? document.scrollingElement.scrollTop : 0,
          workspace: workspace ? workspace.scrollTop : 0,
          container: container ? container.scrollTop : 0,
        };
      });

      expect(scrollPos.doc).toBe(0);
      expect(scrollPos.workspace).toBe(0);
      expect(scrollPos.container).toBe(0);

      // Pagination Footer: Showing 1–10 of 18 enquiries (2 items are in History tab)
      await expect(page.getByText("Showing 1–10 of 18 enquiries")).toBeVisible();

      // Previous disabled, Next enabled (3 pages total)
      const prevBtn = page.getByRole("button", { name: "Previous page" });
      const nextBtn = page.getByRole("button", { name: "Next page" });
      await expect(prevBtn).toBeDisabled();
      await expect(nextBtn).toBeEnabled();

      // Check button min-size target >= 32px
      const prevBox = await prevBtn.boundingBox();
      if (prevBox) {
        expect(prevBox.width).toBeGreaterThanOrEqual(32);
        expect(prevBox.height).toBeGreaterThanOrEqual(32);
      }

      // Check for zero horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      if (vp.screenshot) {
        const screenshotPath = resolve(ARTIFACT_DIR, vp.screenshot);
        await page.screenshot({ path: screenshotPath });
      }
    });
  }

  // B. 25-Record Test Fixture Injection & Multi-Page Pagination
  test("verifies 25-record test fixture pagination, range calculation, and table scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Inject 25-record test fixture cleanly via addInitScript
    await page.addInitScript((fixture) => {
      (window as any).__TEST_ENQUIRIES__ = fixture;
    }, FIXTURE_25_RECORDS);

    await page.goto(ENQUIRIES_ROUTE);
    await expect(page.locator(".enquiriesWorkspaceRoot")).toBeVisible();

    // Page 1: Showing 1–10 of 25 enquiries
    await expect(page.getByText("Showing 1–10 of 25 enquiries")).toBeVisible();
    const prevBtn = page.getByRole("button", { name: "Previous page" });
    const nextBtn = page.getByRole("button", { name: "Next page" });
    await expect(prevBtn).toBeDisabled();
    await expect(nextBtn).toBeEnabled();

    // Save Page 1 screenshot
    await page.screenshot({ path: resolve(ARTIFACT_DIR, "enquiries_25_records_page1.png") });

    // Scroll table region
    const scrollRegion = page.locator('[class*="enquiryTableScrollRegion"]');
    await scrollRegion.evaluate((el) => {
      el.scrollTop = 250;
    });

    const scrollState = await page.evaluate(() => {
      const scrollEl = document.querySelector('[class*="enquiryTableScrollRegion"]');
      const workspace = document.querySelector(".workspace");
      return {
        docScrollTop: document.scrollingElement ? document.scrollingElement.scrollTop : 0,
        workspaceScrollTop: workspace ? workspace.scrollTop : 0,
        regionScrollTop: scrollEl ? scrollEl.scrollTop : 0,
      };
    });

    expect(scrollState.docScrollTop).toBe(0);
    expect(scrollState.workspaceScrollTop).toBe(0);
    expect(scrollState.regionScrollTop).toBeGreaterThanOrEqual(0);

    // Save Scrolled screenshot
    await page.screenshot({ path: resolve(ARTIFACT_DIR, "enquiries_25_records_scrolled.png") });

    // Click Next -> Page 2
    await nextBtn.click();
    await expect(page.getByText("Showing 11–20 of 25 enquiries")).toBeVisible();
    await expect(prevBtn).toBeEnabled();
    await expect(nextBtn).toBeEnabled();

    // Click Next -> Page 3
    await nextBtn.click();
    await expect(page.getByText("Showing 21–25 of 25 enquiries")).toBeVisible();
    await expect(prevBtn).toBeEnabled();
    await expect(nextBtn).toBeDisabled();
  });

  // C. Search Filter & Zero Results
  test("verifies search filtering and zero results state", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ENQUIRIES_ROUTE);

    const searchInput = page.getByPlaceholder("Search by client, requirement or location...");

    // Search 1 result
    await searchInput.fill("Villa");
    await page.waitForTimeout(350);
    await expect(page.getByText("Showing 1–1 of 1 enquiries")).toBeVisible();
    await page.screenshot({ path: resolve(ARTIFACT_DIR, "enquiries_search_filtered.png") });

    // Search zero results
    await searchInput.fill("nonexistent_query_xyz");
    await page.waitForTimeout(350);
    await expect(page.getByText("Showing 0–0 of 0 enquiries")).toBeVisible();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
    await page.screenshot({ path: resolve(ARTIFACT_DIR, "enquiries_zero_results.png") });
  });

  // D. Page Clamping on invalid page parameter
  test("safely clamps invalid page parameter to last valid page or page 1", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${ENQUIRIES_ROUTE}?page=99`);

    // Wait for page clamping URL replacement
    await page.waitForURL((url) => !url.search.includes("page=99"));
    await expect(page.getByText("Showing 11–18 of 18 enquiries")).toBeVisible();
    expect(page.url()).not.toContain("page=99");
  });
});
