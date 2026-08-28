import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/layout/app-shell";
import {
  CLIENT_SIDEBAR_NAVIGATION,
  PROVIDER_SIDEBAR_NAVIGATION,
  SIDEBAR_NAVIGATION,
  getSidebarNavigationForPath,
  getSidebarSectionsForPath,
  isClientPath,
  isSidebarItemActive,
} from "@/components/layout/sidebar-navigation";

// Mock next/navigation
let currentMockPathname = "/client/overview";
vi.mock("next/navigation", () => ({
  usePathname: () => currentMockPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  currentMockPathname = "/client/overview";
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1920,
  });
  if (typeof window !== "undefined") {
    window.localStorage.setItem("kallisto_auth_token", "test-token");
  }
});

afterEach(() => {
  cleanup();
});

describe("Client App Shell & Navigation System", () => {
  it("defines the exact approved client sidebar navigation hierarchy", () => {
    expect(CLIENT_SIDEBAR_NAVIGATION.map((item) => item.label)).toEqual([
      "Ask Odin",
      "Projects",
      "Enquiries",
      "Payments",
      "Providers",
      "Settings",
      "Help & Support",
    ]);

    expect(CLIENT_SIDEBAR_NAVIGATION.map((item) => item.href)).toEqual([
      "/client/overview",
      "/client/projects",
      "/client/enquiries",
      "/client/payments",
      "/client/providers",
      "/client/settings",
      "/client/help",
    ]);
  });

  it("preserves the existing provider sidebar navigation untouched", () => {
    expect(PROVIDER_SIDEBAR_NAVIGATION.map((item) => item.label)).toEqual(
      SIDEBAR_NAVIGATION.map((item) => item.label)
    );
  });

  it("correctly identifies client routes and resolves respective navigation", () => {
    expect(isClientPath("/client/overview")).toBe(true);
    expect(isClientPath("/client/projects")).toBe(true);
    expect(isClientPath("/studio")).toBe(false);
    expect(isClientPath("/projects")).toBe(false);

    expect(getSidebarNavigationForPath("/client/overview")).toEqual(CLIENT_SIDEBAR_NAVIGATION);
    expect(getSidebarNavigationForPath("/studio")).toEqual(PROVIDER_SIDEBAR_NAVIGATION);
    expect(getSidebarSectionsForPath("/client/projects")).toHaveLength(2);
  });

  it("matches active client navigation routes properly", () => {
    expect(isSidebarItemActive("/client", "/client/overview")).toBe(true);
    expect(isSidebarItemActive("/client/overview", "/client/overview")).toBe(true);
    expect(isSidebarItemActive("/client/projects", "/client/projects")).toBe(true);
    expect(isSidebarItemActive("/client/projects/proj-123", "/client/projects")).toBe(true);
    expect(isSidebarItemActive("/client/payments", "/client/overview")).toBe(false);
  });

  it("renders the Client App shell with client navigation links in the DOM", () => {
    currentMockPathname = "/client/overview";
    render(
      <AppShell>
        <div>Client Content</div>
      </AppShell>
    );

    const sidebar = screen.getByRole("complementary", { name: /primary navigation/i });

    expect(sidebar.querySelector('a[href="/client/overview"]')).toBeInTheDocument();
    expect(sidebar.querySelector('a[href="/client/projects"]')).toBeInTheDocument();
    expect(sidebar.querySelector('a[href="/client/enquiries"]')).toBeInTheDocument();
    expect(sidebar.querySelector('a[href="/client/calendar"]')).toBeNull();
    expect(sidebar.querySelector('a[href="/client/documents"]')).toBeNull();
    expect(sidebar.querySelector('a[href="/client/payments"]')).toBeInTheDocument();
    expect(sidebar.querySelector('a[href="/client/providers"]')).toBeInTheDocument();
    expect(sidebar.querySelector('a[href="/client/settings"]')).toBeInTheDocument();
    expect(sidebar.querySelector('a[href="/client/help"]')).toBeInTheDocument();

    expect(screen.getByText("Client Content")).toBeInTheDocument();
  });
});
