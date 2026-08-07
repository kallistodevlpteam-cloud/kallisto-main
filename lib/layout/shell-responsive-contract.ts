import { useSyncExternalStore } from "react";

export type ShellResponsiveMode = "wide" | "standard" | "compact" | "mobile";
export type ShellSidebarMode = "expanded-capable" | "rail" | "overlay";
export type ShellOdinMode = "docked" | "overlay";

export interface ShellResponsiveState {
  shellMode: ShellResponsiveMode;
  sidebarMode: ShellSidebarMode;
  odinMode: ShellOdinMode;
  canDockOdin: boolean;
  odinPinned: boolean;
}

export const SHELL_BREAKPOINTS = {
  wideMin: 1720,
  standardMin: 1380,
  compactMin: 1080,
} as const;

export const MIN_DOCKED_MAIN_WORKSPACE = 1200;
/**
 * SHELL_FRAMING_ALLOCATION represents shell gaps, outer padding, and borders only.
 * Active sidebar width and Odin width are supplied separately to calculateAvailableMainWorkspace().
 */
export const SHELL_FRAMING_ALLOCATION = 82;
export const EXPANDED_SIDEBAR_WIDTH = 240;
export const RAIL_SIDEBAR_WIDTH = 56;
export const ODIN_PANEL_WIDTH = 340;

export function getShellResponsiveMode(viewportWidth: number): ShellResponsiveMode {
  if (viewportWidth >= SHELL_BREAKPOINTS.wideMin) {
    return "wide";
  }
  if (viewportWidth >= SHELL_BREAKPOINTS.standardMin) {
    return "standard";
  }
  if (viewportWidth >= SHELL_BREAKPOINTS.compactMin) {
    return "compact";
  }
  return "mobile";
}

export function calculateAvailableMainWorkspace(
  viewportWidth: number,
  sidebarWidth: number,
  odinWidth: number = 0,
): number {
  return Math.max(0, viewportWidth - sidebarWidth - odinWidth - SHELL_FRAMING_ALLOCATION);
}

export function canDockOdinAtWidth(
  viewportWidth: number,
  sidebarWidth: number,
): boolean {
  return (
    calculateAvailableMainWorkspace(
      viewportWidth,
      sidebarWidth,
      ODIN_PANEL_WIDTH,
    ) >= MIN_DOCKED_MAIN_WORKSPACE
  );
}

let cachedSnapshotState: ShellResponsiveState | null = null;
let cachedViewportWidth: number | null = null;
let cachedUserSidebarCollapsed: boolean | null = null;
let cachedOdinPinned: boolean | null = null;

export function getShellResponsiveState(
  viewportWidth: number,
  userSidebarCollapsed: boolean = false,
  odinPinned: boolean = false,
): ShellResponsiveState {
  if (
    cachedSnapshotState &&
    cachedViewportWidth === viewportWidth &&
    cachedUserSidebarCollapsed === userSidebarCollapsed &&
    cachedOdinPinned === odinPinned
  ) {
    return cachedSnapshotState;
  }

  let shellMode: ShellResponsiveMode = "mobile";
  let sidebarMode: ShellSidebarMode = "overlay";

  if (viewportWidth >= SHELL_BREAKPOINTS.wideMin) {
    shellMode = "wide";
    sidebarMode = "expanded-capable";
  } else if (viewportWidth >= SHELL_BREAKPOINTS.standardMin) {
    shellMode = "standard";
    sidebarMode = "rail";
  } else if (viewportWidth >= SHELL_BREAKPOINTS.compactMin) {
    shellMode = "compact";
    sidebarMode = "rail";
  } else {
    shellMode = "mobile";
    sidebarMode = "overlay";
  }

  const activeSidebarWidth =
    sidebarMode === "expanded-capable"
      ? (userSidebarCollapsed ? RAIL_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH)
      : sidebarMode === "rail"
      ? RAIL_SIDEBAR_WIDTH
      : 0;

  const canDockOdin = canDockOdinAtWidth(viewportWidth, activeSidebarWidth);

  const odinMode: ShellOdinMode = odinPinned && canDockOdin ? "docked" : "overlay";

  const newState: ShellResponsiveState = {
    shellMode,
    sidebarMode,
    odinMode,
    canDockOdin,
    odinPinned,
  };

  cachedViewportWidth = viewportWidth;
  cachedUserSidebarCollapsed = userSidebarCollapsed;
  cachedOdinPinned = odinPinned;
  cachedSnapshotState = newState;

  return newState;
}

export function useShellResponsiveState(
  userSidebarCollapsed: boolean = false,
  odinPinned: boolean = false,
): ShellResponsiveState {
  const subscribe = (callback: () => void) => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  };

  const getSnapshot = () =>
    getShellResponsiveState(window.innerWidth, userSidebarCollapsed, odinPinned);

  const getServerSnapshot = () =>
    getShellResponsiveState(SHELL_BREAKPOINTS.wideMin, userSidebarCollapsed, odinPinned);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useShellResponsiveMode(): ShellResponsiveMode {
  const state = useShellResponsiveState(false, false);
  return state.shellMode;
}
