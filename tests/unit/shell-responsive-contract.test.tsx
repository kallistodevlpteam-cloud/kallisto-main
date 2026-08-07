import { cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "@/components/layout/app-shell";
import {
  calculateAvailableMainWorkspace,
  getShellResponsiveMode,
  getShellResponsiveState,
  MIN_DOCKED_MAIN_WORKSPACE,
  SHELL_BREAKPOINTS,
} from "@/lib/layout/shell-responsive-contract";

afterEach(cleanup);

describe("Shell Responsive Contract", () => {
  it("resolves boundary widths correctly", () => {
    expect(getShellResponsiveMode(1920)).toBe("wide");
    expect(getShellResponsiveMode(SHELL_BREAKPOINTS.wideMin)).toBe("wide");
    expect(getShellResponsiveMode(SHELL_BREAKPOINTS.wideMin - 1)).toBe("standard");

    expect(getShellResponsiveMode(1536)).toBe("standard");
    expect(getShellResponsiveMode(SHELL_BREAKPOINTS.standardMin)).toBe("standard");
    expect(getShellResponsiveMode(SHELL_BREAKPOINTS.standardMin - 1)).toBe("compact");

    expect(getShellResponsiveMode(1280)).toBe("compact");
    expect(getShellResponsiveMode(SHELL_BREAKPOINTS.compactMin)).toBe("compact");
    expect(getShellResponsiveMode(SHELL_BREAKPOINTS.compactMin - 1)).toBe("mobile");

    expect(getShellResponsiveMode(768)).toBe("mobile");
    expect(getShellResponsiveMode(390)).toBe("mobile");
  });

  it("evaluates docking eligibility correctly at 1861px, 1862px, 1879px, 1880px, 1920px, and 1536px", () => {
    // 1861px with expanded sidebar 240px: available = 1861 - 240 - 340 - 82 = 1199px -> canDockOdin: false
    const state1861 = getShellResponsiveState(1861, false, true);
    expect(calculateAvailableMainWorkspace(1861, 240, 340)).toBe(1199);
    expect(state1861.canDockOdin).toBe(false);
    expect(state1861.odinMode).toBe("overlay"); // pinned converts to overlay when ineligible

    // 1862px with expanded sidebar 240px: available = 1862 - 240 - 340 - 82 = 1200px -> canDockOdin: true
    const state1862Pinned = getShellResponsiveState(1862, false, true);
    expect(calculateAvailableMainWorkspace(1862, 240, 340)).toBe(1200);
    expect(state1862Pinned.canDockOdin).toBe(true);
    expect(state1862Pinned.odinMode).toBe("docked");

    const state1862Unpinned = getShellResponsiveState(1862, false, false);
    expect(state1862Unpinned.odinMode).toBe("overlay"); // unpinned remains overlay even when eligible

    // 1879px with expanded sidebar 240px: available = 1879 - 240 - 340 - 82 = 1217px -> canDockOdin: true
    const state1879Pinned = getShellResponsiveState(1879, false, true);
    expect(calculateAvailableMainWorkspace(1879, 240, 340)).toBe(1217);
    expect(state1879Pinned.canDockOdin).toBe(true);
    expect(state1879Pinned.odinMode).toBe("docked");

    const state1879Unpinned = getShellResponsiveState(1879, false, false);
    expect(state1879Unpinned.odinMode).toBe("overlay");

    // 1880px with expanded sidebar 240px: available = 1880 - 240 - 340 - 82 = 1218px -> canDockOdin: true
    const state1880Pinned = getShellResponsiveState(1880, false, true);
    expect(calculateAvailableMainWorkspace(1880, 240, 340)).toBe(1218);
    expect(state1880Pinned.canDockOdin).toBe(true);
    expect(state1880Pinned.odinMode).toBe("docked");

    // 1920px with expanded sidebar 240px: available = 1920 - 240 - 340 - 82 = 1258px -> canDockOdin: true
    const state1920Pinned = getShellResponsiveState(1920, false, true);
    expect(calculateAvailableMainWorkspace(1920, 240, 340)).toBe(1258);
    expect(state1920Pinned.canDockOdin).toBe(true);
    expect(state1920Pinned.odinMode).toBe("docked");

    const state1920Unpinned = getShellResponsiveState(1920, false, false);
    expect(state1920Unpinned.odinMode).toBe("overlay");

    // 1536px with 56px rail sidebar: available = 1536 - 56 - 340 - 82 = 1058px -> canDockOdin: false
    const state1536Pinned = getShellResponsiveState(1536, false, true);
    expect(calculateAvailableMainWorkspace(1536, 56, 340)).toBe(1058);
    expect(state1536Pinned.canDockOdin).toBe(false);
    expect(state1536Pinned.odinMode).toBe("overlay");
  });

  it("renders data-shell-mode, data-sidebar-mode, data-odin-mode, data-odin-pinned, data-odin-can-dock on AppShell", () => {
    const { container } = render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    const appShellEl = container.querySelector(".app-shell");

    expect(appShellEl).toHaveAttribute("data-shell-mode");
    expect(appShellEl).toHaveAttribute("data-sidebar-mode");
    expect(appShellEl).toHaveAttribute("data-sidebar-state");
    expect(appShellEl).toHaveAttribute("data-odin-mode");
    expect(appShellEl).toHaveAttribute("data-odin-pinned");
    expect(appShellEl).toHaveAttribute("data-odin-can-dock");
    expect(appShellEl).toHaveAttribute("data-odin-open");
  });
});
