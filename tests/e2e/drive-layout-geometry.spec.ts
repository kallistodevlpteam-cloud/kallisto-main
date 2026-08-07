import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const viewports = [
  { width: 1638, height: 922 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1638, height: 700 },
];

for (const vp of viewports) {
  test.describe(`Drive Layout Geometry at ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test("verifies exact boundary alignment between collection bottom and pagination top, fully visible pagination buttons, and no clipping", async ({
      page,
    }) => {
      await page.goto("/projects/proj-001/documents");

      // 1. "Docs" compact title and module navigation visible
      const titleH1 = page.getByRole("heading", { name: "Docs", level: 1 });
      await expect(titleH1).toBeVisible();

      const moduleNav = page.getByRole("navigation", {
        name: "Document page navigation",
      });
      await expect(moduleNav).toBeVisible();

      // 2. Table, rows, and pagination visible
      const collection = page.locator("[data-drive-collection-viewport]");
      const table = page.getByRole("table");
      const rows = table.locator("tbody tr");
      const pagination = page.getByRole("navigation", { name: "Document pages" });

      await expect(table).toBeVisible();

      // Page size is 10 at width >= 1440, 8 at width 1024-1439
      const expectedRowCount = vp.width >= 1440 ? 10 : 8;
      await expect(rows).toHaveCount(expectedRowCount);
      await expect(pagination).toBeVisible();

      // 3. Locate the route boundary element
      const boundedRoute = page.locator('[class*="documentsBoundedRoute"]');
      const routeBox = await boundedRoute.boundingBox();
      expect(routeBox).not.toBeNull();

      // 4. Precise geometry bounding box assertions
      const collectionBox = await collection.boundingBox();
      const tableBox = await table.boundingBox();
      const paginationBox = await pagination.boundingBox();

      expect(collectionBox).not.toBeNull();
      expect(tableBox).not.toBeNull();
      expect(paginationBox).not.toBeNull();

      expect(collectionBox!.height).toBeGreaterThan(150);
      expect(tableBox!.height).toBeGreaterThan(250);

      // CRITICAL: collection bottom === pagination top (tolerance <= 1px)
      const collectionBottom = collectionBox!.y + collectionBox!.height;
      const paginationTop = paginationBox!.y;
      expect(Math.abs(collectionBottom - paginationTop)).toBeLessThanOrEqual(1);

      // Pagination must be exactly 48px tall
      expect(paginationBox!.height).toBe(48);

      // CRITICAL: pagination bottom must not exceed viewport height
      const paginationBottom = paginationBox!.y + paginationBox!.height;
      expect(paginationBottom).toBeLessThanOrEqual(vp.height);

      // CRITICAL: pagination bottom must not exceed route bottom
      const routeBottom = routeBox!.y + routeBox!.height;
      expect(paginationBottom).toBeLessThanOrEqual(routeBottom);

      // 5. All pagination controls must be fully contained inside pagination and viewport
      const controls = [
        pagination.getByRole("button", { name: "Previous page" }),
        pagination.getByRole("button", { name: "Page 1" }),
        pagination.getByRole("button", { name: "Page 2" }),
        pagination.getByRole("button", { name: "Page 3" }),
        pagination.getByRole("button", { name: "Next page" }),
      ];

      for (const control of controls) {
        await expect(control).toBeVisible();

        const controlBox = await control.boundingBox();
        expect(controlBox).not.toBeNull();

        const controlBottom = controlBox!.y + controlBox!.height;

        // Control top must be at or after pagination top
        expect(controlBox!.y).toBeGreaterThanOrEqual(paginationBox!.y);

        // Control bottom must be within pagination bottom
        expect(controlBottom).toBeLessThanOrEqual(paginationBottom);

        // Control bottom must be within route boundary
        expect(controlBottom).toBeLessThanOrEqual(routeBottom);

        // Control bottom must be within viewport
        expect(controlBottom).toBeLessThanOrEqual(vp.height);

        // Also assert via Playwright's built-in viewport check (full containment)
        await expect(control).toBeInViewport({ ratio: 1 });
      }

      // 6. Header and first row visibility
      const tableHeader = table.locator("thead");
      await expect(tableHeader).toBeVisible();

      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();

      // 7. Internal scroll check on collectionViewport
      const scrollMetrics = await collection.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));
      expect(scrollMetrics.clientHeight).toBeGreaterThan(150);
      expect(scrollMetrics.scrollHeight).toBeGreaterThanOrEqual(
        scrollMetrics.clientHeight,
      );

      // 8. Body must not scroll — all vertical scroll is internal
      const bodyScrollMetrics = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      }));
      expect(bodyScrollMetrics.scrollHeight).toBeLessThanOrEqual(
        bodyScrollMetrics.clientHeight + 12,
      );

      // 9. Verify the 8px row-gap between compactDriveHeader and driveWorkspace
      const driveWorkspace = page.locator('[class*="driveWorkspace"]').first();
      const headerEl = page.locator('[class*="compactDriveHeader"]');
      const headerBox = await headerEl.boundingBox();
      const driveWorkspaceBox = await driveWorkspace.boundingBox();

      expect(headerBox).not.toBeNull();
      expect(driveWorkspaceBox).not.toBeNull();

      const compactHeaderBottom = headerBox!.y + headerBox!.height;
      const driveWorkspaceTop = driveWorkspaceBox!.y;
      const gapActual = driveWorkspaceTop - compactHeaderBottom;

      // Allow ±1px tolerance; gap must be approximately 8px
      expect(Math.abs(gapActual - 8)).toBeLessThanOrEqual(1);

      // 10. Emit numeric geometry report to console for audit
      const documentsWorkspaceEl = page.locator('[class*="documentsWorkspace"]');
      const wsBox = await documentsWorkspaceEl.boundingBox();

      console.log(`\n=== GEOMETRY REPORT ${vp.width}x${vp.height} ===`);
      console.log(`documentsWorkspace height:   ${wsBox?.height ?? "n/a"}`);
      console.log(`compactDriveHeader bottom:   ${compactHeaderBottom}`);
      console.log(`driveWorkspace top:          ${driveWorkspaceTop}`);
      console.log(`driveWorkspace bottom:       ${driveWorkspaceBox!.y + driveWorkspaceBox!.height}`);
      console.log(`driveContent bottom:         (inside driveWorkspace)`);
      console.log(`collectionViewport bottom:   ${collectionBottom}`);
      console.log(`pagination top:              ${paginationTop}`);
      console.log(`pagination bottom:           ${paginationBottom}`);
      console.log(`route bottom:                ${routeBottom}`);
      console.log(`viewport height:             ${vp.height}`);
      console.log(`gap (header→workspace):      ${gapActual}`);
      console.log(`=== END GEOMETRY REPORT ===\n`);

      // 11. Save screenshot for reporting
      const screenshotsDir = path.join(
        process.cwd(),
        "public",
        "assets",
        "screenshots",
      );
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      await page.screenshot({
        path: path.join(
          screenshotsDir,
          `drive-${vp.width}x${vp.height}.png`,
        ),
        fullPage: false,
      });
    });
  });
}
