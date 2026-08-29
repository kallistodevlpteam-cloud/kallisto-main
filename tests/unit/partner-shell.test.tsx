import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PartnerAppShell } from "@/partner-app/layout/partner-app-shell";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";
import {
  PARTNER_HANDS_NAVIGATION,
  PARTNER_HUB_NAVIGATION,
  PARTNER_BASICS_NAVIGATION,
  getSidebarNavigationForPath,
  isPartnerPath,
} from "@/components/layout/sidebar-navigation";

// Mock next/navigation
let currentMockPathname = "/partner/hands";
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

describe("Partner App Shell & Navigation", () => {
  beforeEach(async () => {
    currentMockPathname = "/partner/hands";
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920,
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kallisto_auth_token", "test-partner-token");
    }
    PartnerAuthService.clearSession();
    await PartnerAuthService.authenticate({
      emailOrPhone: "vikram@kallisto-hands.com",
      partnerType: "HANDS",
    });
  });

  afterEach(cleanup);

  it("identifies partner paths correctly", () => {
    expect(isPartnerPath("/partner/hands")).toBe(true);
    expect(isPartnerPath("/partner/hub")).toBe(true);
    expect(isPartnerPath("/partner/basics")).toBe(true);
    expect(isPartnerPath("/client/overview")).toBe(false);
    expect(isPartnerPath("/studio")).toBe(false);
  });

  it("returns configured navigation arrays per partner ecosystem", () => {
    expect(PARTNER_HANDS_NAVIGATION.map((item) => item.label)).toEqual([
      "Overview",
      "Workforce",
      "Workers",
      "Requests",
      "Assignments",
      "Attendance",
      "Projects",
      "Payments",
      "Documents",
      "Performance",
      "Settings",
      "Help & Support",
    ]);

    expect(PARTNER_HUB_NAVIGATION.map((item) => item.label)).toEqual([
      "Home",
      "Products",
      "Inventory",
      "Suppliers",
      "Orders",
      "Calendar",
      "Payments",
      "Support",
    ]);

    expect(PARTNER_BASICS_NAVIGATION.map((item) => item.label)).toEqual([
      "Overview",
      "Services",
      "Requests",
      "Customers",
      "Assignments",
      "Projects",
      "Schedule",
      "Payments",
      "Documents",
      "Performance",
      "Settings",
      "Help & Support",
    ]);
  });

  it("renders Hands sidebar navigation items for Hands partner", () => {
    currentMockPathname = "/partner/hands";
    render(
      <PartnerAppShell>
        <div>Hands Workspace Body</div>
      </PartnerAppShell>
    );

    expect(screen.getByText("Hands Workspace Body")).toBeDefined();
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getByText("Workforce")).toBeDefined();
    expect(screen.getByText("Workers")).toBeDefined();
    expect(screen.getByText("Attendance")).toBeDefined();
    expect(screen.getAllByText("Assignments").length).toBeGreaterThan(0);
    expect(screen.getByText("Performance")).toBeDefined();
    expect(screen.getAllByRole("button", { name: /Ask Odin/i }).length).toBeGreaterThan(0);
  });

  it("dynamically renders Hub navigation when navigating to Hub", async () => {
    currentMockPathname = "/partner/hub";
    await PartnerAuthService.authenticate({
      emailOrPhone: "ananya@kallisto-hub.com",
      partnerType: "HUB",
    });

    render(
      <PartnerAppShell>
        <div>Hub Workspace Body</div>
      </PartnerAppShell>
    );

    expect(screen.getByText("Products")).toBeDefined();
    expect(screen.getByText("Inventory")).toBeDefined();
    expect(screen.getByText("Suppliers")).toBeDefined();
    expect(screen.getByText("Orders")).toBeDefined();
    expect(screen.getByText("Payments")).toBeDefined();
    expect(screen.getByText("Support")).toBeDefined();
  });

  it("dynamically renders Basics navigation when navigating to Basics", async () => {
    currentMockPathname = "/partner/basics";
    await PartnerAuthService.authenticate({
      emailOrPhone: "rohan@kallisto-basics.com",
      partnerType: "BASICS",
    });

    render(
      <PartnerAppShell>
        <div>Basics Workspace Body</div>
      </PartnerAppShell>
    );

    expect(screen.getByText("Services")).toBeDefined();
    expect(screen.getByText("Customers")).toBeDefined();
    expect(screen.getByText("Schedule")).toBeDefined();
    expect(screen.getAllByText("Assignments").length).toBeGreaterThan(0);
  });

  it("opens Odin assistant workspace when clicking Ask Odin in the header", async () => {
    currentMockPathname = "/partner/hands";
    render(
      <PartnerAppShell>
        <div>Workspace Body</div>
      </PartnerAppShell>
    );

    const askOdinBtn = screen.getAllByRole("button", { name: /Ask Odin/i })[0];
    fireEvent.click(askOdinBtn);

    expect(screen.getAllByText(/Odin/i).length).toBeGreaterThan(0);
  });
});
