import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getProjectDashboardGeometry,
  getProjectUpdatesLayoutMode,
  getSidebarCompactMediaQuery,
  isSidebarCompactAtWidth,
  PROJECT_MAIN_MIN_WIDTH,
  PROJECT_UPDATES_MAX_WIDTH,
  PROJECT_UPDATES_MIN_CONTAINER_WIDTH,
  PROJECT_UPDATES_MIN_WIDTH,
} from "@/lib/layout/project-dashboard-responsive-contract";

describe("project dashboard responsive contract", () => {
  it("uses the project-only 1440/1439 compact-sidebar boundary", () => {
    expect(isSidebarCompactAtWidth("project-dashboard", 1440)).toBe(false);
    expect(isSidebarCompactAtWidth("project-dashboard", 1439)).toBe(true);
    expect(getSidebarCompactMediaQuery("project-dashboard")).toBe(
      "(max-width: 1439px)",
    );

    expect(isSidebarCompactAtWidth("default", 1439)).toBe(false);
    expect(getSidebarCompactMediaQuery("default")).toBe("(max-width: 1160px)");
  });

  it("uses drawer below 1200 regardless of available component capacity", () => {
    expect(getProjectUpdatesLayoutMode(1200, 1400)).toBe("rail");
    expect(getProjectUpdatesLayoutMode(1199, 1400)).toBe("drawer");
  });

  it("uses the exact 1044/1043 capacity boundary at desktop widths", () => {
    expect(PROJECT_UPDATES_MIN_CONTAINER_WIDTH).toBe(1044);
    expect(getProjectUpdatesLayoutMode(1440, 1044)).toBe("rail");
    expect(getProjectUpdatesLayoutMode(1440, 1043)).toBe("drawer");
  });

  it("preserves the 680px main and 340px Updates minima at the rail floor", () => {
    expect(getProjectDashboardGeometry(1200, 1044)).toEqual({
      mode: "rail",
      mainWidth: 680,
      updatesWidth: 340,
      gap: 24,
    });
  });

  it.each([
    [1920, 1604, "rail"],
    [1536, 1220, "rail"],
    [1440, 1126, "rail"],
    [1366, 1236, "rail"],
    [1280, 1150, "rail"],
    [1200, 1070, "rail"],
    [1100, 970, "drawer"],
    [1024, 894, "drawer"],
  ] as const)(
    "keeps valid geometry for %i viewport and %i dashboard width",
    (viewportWidth, containerWidth, expectedMode) => {
      const geometry = getProjectDashboardGeometry(viewportWidth, containerWidth);
      expect(geometry.mode).toBe(expectedMode);

      if (geometry.mode === "rail") {
        expect(geometry.mainWidth).toBeGreaterThanOrEqual(PROJECT_MAIN_MIN_WIDTH);
        expect(geometry.updatesWidth).toBeGreaterThanOrEqual(PROJECT_UPDATES_MIN_WIDTH);
        expect(geometry.updatesWidth).toBeLessThanOrEqual(PROJECT_UPDATES_MAX_WIDTH);
        expect(geometry.gap).toBe(24);
      } else {
        expect(geometry.mainWidth).toBe(containerWidth);
        expect(geometry.updatesWidth).toBe(0);
        expect(geometry.gap).toBe(0);
      }
    },
  );

  it("bounds schedule and task workspaces while leaving Drive to the page scroll owner", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    expect(css).not.toContain("calc(100vh - 148px)");

    const fixedWorkspaceRules = css.slice(
      css.indexOf("/* Strictly scope fixed height outer layout"),
      css.indexOf(".page-heading"),
    );
    expect(fixedWorkspaceRules).not.toContain(".poc-wrapper");
    expect(fixedWorkspaceRules).toContain(".schedulePageMainShell");
    expect(fixedWorkspaceRules).toContain(".projectTasksWorkspace");
    expect(fixedWorkspaceRules).not.toContain('[class*="documentsWorkspace"]');

    const leftColumnRule = css.slice(
      css.indexOf(".poc-left-column"),
      css.indexOf(".project-stat-cards-bar"),
    );
    expect(leftColumnRule).toContain("overflow-y: auto");
    expect(leftColumnRule).toContain("overflow-x: clip");
    expect(leftColumnRule).not.toContain("overflow-x: auto");

    const hiddenScrollbarRules = css.slice(
      css.indexOf(".project-dashboard-page .poc-left-column,"),
      css.indexOf('.poc-wrapper[data-updates-mode="drawer"] .poc-sections-card'),
    );
    expect(hiddenScrollbarRules).toContain("scrollbar-width: none");
    expect(hiddenScrollbarRules).toContain("-ms-overflow-style: none");
    expect(hiddenScrollbarRules).toContain(
      ".project-dashboard-page .poc-left-column::-webkit-scrollbar",
    );
    expect(hiddenScrollbarRules).toContain(
      ".project-dashboard-page .poc-sections-card::-webkit-scrollbar",
    );

    const projectWorkspaceRule = css.slice(
      css.indexOf(".app-shell.has-project-dashboard-profile .workspace"),
      css.indexOf(".workspace-container"),
    );
    expect(projectWorkspaceRule).toContain("overflow: hidden");

    const projectContainerRule = css.slice(
      css.indexOf(".workspace-container.project-dashboard-page"),
      css.indexOf(".route-content-wrap:has"),
    );
    expect(projectContainerRule).toContain(
      "grid-template-rows: auto minmax(0, 1fr)",
    );
    expect(projectContainerRule).toContain("overflow: hidden");
  });
});
