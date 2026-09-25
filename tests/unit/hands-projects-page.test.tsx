import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HandsProjectsWorkspace } from "@/partner-app/hands/components/projects/hands-projects-workspace";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/projects",
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Kallisto Hands - Projects Directory Workspace & Summary Cards", () => {
  beforeEach(async () => {
    cleanup();
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

  it("renders 4 KPI summary cards (8 Active Projects, 6 Upcoming, 2 Completed, 92% Overall Progress)", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Active Projects")).toBeDefined();
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Upcoming").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);

    expect(screen.getByText("Overall Progress")).toBeDefined();
    expect(screen.getAllByText("92%").length).toBeGreaterThan(0);
  });

  it("renders filter bar with Project Phase, Needs Attention/All Status, Location, and Recently updated filters (no Ownership filter)", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    // Filters specified in prompt/reference
    expect(screen.getByText("Project Phase")).toBeDefined();
    expect(screen.getByText("All Status")).toBeDefined();
    expect(screen.getByText("Location")).toBeDefined();
    expect(screen.getByText("Recently updated")).toBeDefined();

    // Ownership filter must NOT be present
    expect(screen.queryByText("Ownership")).toBeNull();
  });

  it("opens Location popover with Search input, Checkbox list, Clear and Apply buttons (matching Screenshot 2)", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    const locationBtn = screen.getByRole("button", { name: /^Location$/i });
    fireEvent.click(locationBtn);

    // Location Popover Card appears
    expect(screen.getByPlaceholderText(/Search city or district/i)).toBeDefined();
    expect(screen.getAllByText("Bangalore, Karnataka").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Calicut, Kerala").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kochi, Kerala").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /^Clear$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Apply$/i })).toBeDefined();
  });

  it("opens Project Phase popover with menu phase list (matching Screenshot 3)", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    const phaseBtn = screen.getByRole("button", { name: /^Project Phase$/i });
    fireEvent.click(phaseBtn);

    // Phase Popover Card appears
    expect(screen.getByText("Briefing")).toBeDefined();
    expect(screen.getByText("Site verification")).toBeDefined();
    expect(screen.getByText("Concept")).toBeDefined();
    expect(screen.getByText("Design development")).toBeDefined();
    expect(screen.getByText("Approvals")).toBeDefined();
    expect(screen.getByText("BOQ and procurement")).toBeDefined();
    expect(screen.getAllByText("Construction").length).toBeGreaterThan(0);
    expect(screen.getByText("Handover")).toBeDefined();
    expect(screen.getByText("Post-handover")).toBeDefined();
  });

  it("closes open popover dropdown when clicking outside", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    const phaseBtn = screen.getByRole("button", { name: /^Project Phase$/i });
    fireEvent.click(phaseBtn);

    // Popover is open
    expect(screen.getByText("Briefing")).toBeDefined();

    // Fire click outside on document body
    fireEvent.mouseDown(document.body);

    // Popover is closed
    expect(screen.queryByText("Briefing")).toBeNull();
  });

  it("renders status section tabs (Current Projects, Upcoming, Completed)", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Current Projects")).toBeDefined();
    expect(screen.getAllByText("Upcoming").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
  });

  it("filters project cards when clicking section tabs", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    // Click Upcoming tab
    const upcomingTab = screen.getByRole("tab", { name: /Upcoming/i });
    fireEvent.click(upcomingTab);

    expect(screen.getByText("Skyline Heights Villa")).toBeDefined();
    expect(screen.getByText("Verona Luxury Residence")).toBeDefined();
    expect(screen.queryByText("Nila Luxury Residence")).toBeNull();
  });

  it("renders structured project cards matching reference layout with title, progress percent, location, and client name", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    // Nila Luxury Residence (70%)
    expect(screen.getByText("Nila Luxury Residence")).toBeDefined();
    expect(screen.getByText("70%")).toBeDefined();
    expect(screen.getAllByText("Trivandrum, Kerala").length).toBeGreaterThan(0);
    expect(screen.getByText("Anoop Kumar")).toBeDefined();

    // Azure Oceanfront Villa (45%)
    expect(screen.getByText("Azure Oceanfront Villa")).toBeDefined();
    expect(screen.getByText("45%")).toBeDefined();
    expect(screen.getAllByText("Calicut, Kerala").length).toBeGreaterThan(0);
    expect(screen.getByText("Riya Thomas")).toBeDefined();

    // In progress badges overlay
    expect(screen.getAllByText("In progress").length).toBeGreaterThan(0);
  });

  it("links each project card to its dedicated project detail page", () => {
    render(
      <PartnerAuthProvider>
        <HandsProjectsWorkspace />
      </PartnerAuthProvider>
    );

    const nilaCard = screen.getByRole("link", { name: /Nila Luxury Residence/i });
    expect(nilaCard.getAttribute("href")).toBe("/partner/hands/projects/PRJ-101");
  });
});
