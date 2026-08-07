export type AppShellLayoutProfile = "default" | "project-dashboard";
export type ProjectUpdatesLayoutMode = "rail" | "drawer";

export const DEFAULT_SIDEBAR_COMPACT_MAX_WIDTH = 1160;
export const PROJECT_SIDEBAR_COMPACT_MAX_WIDTH = 1439;

export const PROJECT_UPDATES_MIN_VIEWPORT_WIDTH = 1200;
export const PROJECT_MAIN_MIN_WIDTH = 680;
export const PROJECT_UPDATES_GAP = 24;
export const PROJECT_UPDATES_MIN_WIDTH = 340;
export const PROJECT_UPDATES_PREFERRED_WIDTH = 360;
export const PROJECT_UPDATES_MAX_WIDTH = 400;
export const PROJECT_UPDATES_MIN_CONTAINER_WIDTH =
  PROJECT_MAIN_MIN_WIDTH + PROJECT_UPDATES_GAP + PROJECT_UPDATES_MIN_WIDTH;
export const PROJECT_UPDATES_PANEL_ID = "project-updates-panel";

export interface ProjectDashboardGeometry {
  mode: ProjectUpdatesLayoutMode;
  mainWidth: number;
  updatesWidth: number;
  gap: number;
}

export function getSidebarCompactMaxWidth(profile: AppShellLayoutProfile): number {
  return profile === "project-dashboard"
    ? PROJECT_SIDEBAR_COMPACT_MAX_WIDTH
    : DEFAULT_SIDEBAR_COMPACT_MAX_WIDTH;
}

export function getSidebarCompactMediaQuery(profile: AppShellLayoutProfile): string {
  return `(max-width: ${getSidebarCompactMaxWidth(profile)}px)`;
}

export function isSidebarCompactAtWidth(
  profile: AppShellLayoutProfile,
  viewportWidth: number,
): boolean {
  return viewportWidth <= getSidebarCompactMaxWidth(profile);
}

export function getProjectUpdatesLayoutMode(
  viewportWidth: number,
  containerWidth: number,
): ProjectUpdatesLayoutMode {
  return viewportWidth >= PROJECT_UPDATES_MIN_VIEWPORT_WIDTH &&
    containerWidth >= PROJECT_UPDATES_MIN_CONTAINER_WIDTH
    ? "rail"
    : "drawer";
}

export function getProjectUpdatesRailWidth(containerWidth: number): number {
  const fluidWidth =
    PROJECT_UPDATES_PREFERRED_WIDTH + (containerWidth - 1200) * 0.3;
  const maximumWidthThatPreservesMain =
    containerWidth - PROJECT_UPDATES_GAP - PROJECT_MAIN_MIN_WIDTH;

  return Math.min(
    PROJECT_UPDATES_MAX_WIDTH,
    Math.max(PROJECT_UPDATES_MIN_WIDTH, fluidWidth),
    maximumWidthThatPreservesMain,
  );
}

export function getProjectDashboardGeometry(
  viewportWidth: number,
  containerWidth: number,
): ProjectDashboardGeometry {
  const mode = getProjectUpdatesLayoutMode(viewportWidth, containerWidth);

  if (mode === "drawer") {
    return {
      mode,
      mainWidth: Math.max(0, containerWidth),
      updatesWidth: 0,
      gap: 0,
    };
  }

  const updatesWidth = getProjectUpdatesRailWidth(containerWidth);
  return {
    mode,
    mainWidth: containerWidth - PROJECT_UPDATES_GAP - updatesWidth,
    updatesWidth,
    gap: PROJECT_UPDATES_GAP,
  };
}
