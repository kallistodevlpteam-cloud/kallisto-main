import { test, expect } from '@playwright/test';
import { resolve } from 'path';

const ARTIFACT_DIR = 'C:/Users/sarik/.gemini/antigravity/brain/c45a38ae-c3c9-40c6-88b7-55d42ea688c8';

test.describe('iPad Air Viewport Responsiveness', () => {
  const ipadViewports = [
    { name: 'ipad_air_portrait_820x1180', width: 820, height: 1180 },
    { name: 'ipad_air_11_portrait_834x1194', width: 834, height: 1194 },
    { name: 'ipad_air_landscape_1180x820', width: 1180, height: 820 },
    { name: 'ipad_air_11_landscape_1194x834', width: 1194, height: 834 }
  ];

  for (const vp of ipadViewports) {
    test(`renders cleanly at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/enquiries');

      await expect(page.locator('.enquiriesWorkspaceRoot')).toBeVisible();

      // Ensure no unexpected horizontal scrolling on the root page
      const docScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      expect(docScrollWidth).toBeLessThanOrEqual(windowWidth + 1);

      await page.screenshot({ path: resolve(ARTIFACT_DIR, `${vp.name}.png`), fullPage: false });
    });
  }
});
