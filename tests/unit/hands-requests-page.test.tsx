import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HandsRequestsWorkspace } from "@/partner-app/hands/components/requests/hands-requests-workspace";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/requests",
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

describe("Kallisto Hands - Requests Page & Workforce Match Intelligence", () => {
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

  it("renders page header with Title, Subtitle and Dispatch Zone strip", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByRole("heading", { name: "Requests" })).toBeDefined();
    expect(screen.getByText(/Active Requisitions & Demands/i)).toBeDefined();
    expect(screen.getByText(/DISPATCH ZONE:/i)).toBeDefined();
    expect(screen.getByText(/Edit/i)).toBeDefined();
  });

  it("renders workflow-based status navigation pill tabs (Requests, History; no Accepted or Closed)", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByRole("tab", { name: /^Requests/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /History/i })).toBeDefined();
    expect(screen.queryByRole("tab", { name: /^Accepted/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /^Closed/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /Under Review/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /All Requests/i })).toBeNull();
  });

  it("renders 4 compact operational summary KPI cards with icon badges", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("New Requests")).toBeDefined();
    expect(screen.getByText("Workers Needed")).toBeDefined();
    expect(screen.getByText("Can Fulfil")).toBeDefined();
    expect(screen.getByText("Need Attention")).toBeDefined();
  });

  it("renders request cards with required workforce count and details", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText("Greenwood Residency")).toBeDefined();
    expect(screen.getByText("Skyline Apartments")).toBeDefined();
    expect(screen.getByText("Azure Waterfront Towers")).toBeDefined();

    // Verify worker counts
    expect(screen.getAllByText("12 Workers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6 Workers").length).toBeGreaterThan(0);
  });

  it("filters request list when searching by keyword or project name", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search requests, projects, trades.../i);
    fireEvent.change(searchInput, { target: { value: "Skyline" } });

    expect(screen.getByText("Skyline Apartments")).toBeDefined();
    expect(screen.queryByText("Greenwood Residency")).toBeNull();
  });

  it("switches to History tab and displays rejected requests only (no closed requests)", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const historyTab = screen.getByRole("tab", { name: /History/i });
    fireEvent.click(historyTab);

    // Displays rejected requests
    expect(screen.getByText("National Highway Flyover Pier 42")).toBeDefined();
    expect(screen.getByText("Kochi Metro Phase 2 Extension")).toBeDefined();

    // Closed requests should not be displayed in History
    expect(screen.queryByText("CyberGateway IT Center")).toBeNull();
    expect(screen.queryByText("Lulu Twin Tower Fitout")).toBeNull();

    // Active requests from Requests tab should not be in History
    expect(screen.queryByText("Greenwood Residency")).toBeNull();
  });

  it("opens request detail workspace modal with period tasks and Match Available Candidates button", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[0]);

    expect(screen.getByText("Workforce Required")).toBeDefined();
    expect(screen.getByText("Work Details")).toBeDefined();
    expect(screen.getByText("Tasks to Complete During This Period")).toBeDefined();
    expect(screen.getByText("Workforce Match Intelligence")).toBeDefined();

    // Verify task title, trade next to hours (e.g. Mason · 120h), and priority pills
    expect(screen.getByText("RCC Framework & Column Casting")).toBeDefined();
    expect(screen.getByText(/Mason · 120h/)).toBeDefined();
    expect(screen.getAllByText("High").length).toBe(2);
    expect(screen.getByText("Brick Masonry & Wall Plastering")).toBeDefined();
    expect(screen.getByText(/Mason · 96h/)).toBeDefined();
    expect(screen.getByText("Internal Electrical Wiring")).toBeDefined();
    expect(screen.getByText(/Electrician · 64h/)).toBeDefined();
    expect(screen.getAllByText("Medium").length).toBe(2);
    expect(screen.getByText("Plumbing & Sanitary Fixtures")).toBeDefined();
    expect(screen.getByText(/Plumber · 48h/)).toBeDefined();

    // Verify scope checklist was removed from Project Brief & Scope
    expect(screen.queryByText("Exterior 200mm solid block masonry")).toBeNull();
    expect(screen.queryByText("Internal 100mm partition walls")).toBeNull();

    // Footer actions: Accept & View Matched Candidates and Decline buttons are present
    expect(screen.getByRole("button", { name: /Accept & View Matched Candidates/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Decline$/i })).toBeDefined();
  });

  it("advances to clean matched available candidates view matching approved layout", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[0]);

    // Click Accept & View Matched Candidates CTA to advance to candidate review
    const acceptBtn = screen.getByRole("button", { name: /Accept & View Matched Candidates/i });
    fireEvent.click(acceptBtn);

    // Overlay displays matched available candidates separated by trade
    expect(screen.getByText(/Masons \(6\)/i)).toBeDefined();
    expect(screen.getByText(/Helpers \(4\)/i)).toBeDefined();
    expect(screen.getByText("Rajesh Kumar")).toBeDefined();
    expect(screen.getByText("Vipin Das")).toBeDefined();
    expect(screen.getAllByText(/Ready for assignment/i).length).toBe(10);

    // Shortage requirement badge: Masons shows "8 Required" (red shortage badge); Helpers has no shortage so "4 Required" is omitted
    expect(screen.queryByText(/6 Available/i)).toBeNull();
    expect(screen.getByText(/8 Required/i)).toBeDefined();
    expect(screen.queryByText(/4 Required/i)).toBeNull();

    // No checkboxes in initial matched view (all candidates auto-assigned)
    expect(screen.queryAllByRole("checkbox").length).toBe(0);

    // Verify quota progress and check availability buttons are removed
    expect(screen.queryByText("Workforce Allocation Progress")).toBeNull();
    expect(screen.queryByText(/Check Availability/i)).toBeNull();

    // Confirm candidate assignment
    const assignBtn = screen.getByRole("button", { name: /^Assign Candidates$/i });
    fireEvent.click(assignBtn);

    // Verify success confirmation screen with summary box and Confirm button
    expect(screen.getByText(/Request Accepted & Crew Assigned!/i)).toBeDefined();
    expect(screen.getByText("Workforce Demand:")).toBeDefined();
    expect(screen.getByText("Timeline:")).toBeDefined();
    expect(screen.getByText("Site Location:")).toBeDefined();
    expect(screen.getByRole("button", { name: /^Confirm$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Cancel$/i })).toBeDefined();

    // Click Confirm button
    const confirmBtn = screen.getByRole("button", { name: /^Confirm$/i });
    fireEvent.click(confirmBtn);
  });

  it("supports viewing all available candidates for Helpers and allows contractor selection", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[0]);

    const acceptBtn = screen.getByRole("button", { name: /Accept & View Matched Candidates/i });
    fireEvent.click(acceptBtn);

    // Initial state: Masons (6) with no checkboxes; Helpers (4) with "View All Available Helpers (8)" button
    expect(screen.getByText(/Masons \(6\)/i)).toBeDefined();
    expect(screen.getByText(/Helpers \(4\)/i)).toBeDefined();
    expect(screen.queryByText(/6 Available/i)).toBeNull();
    expect(screen.queryAllByRole("checkbox").length).toBe(0);

    // Find the button to view all available helpers
    const viewAllHelpersBtn = screen.getByRole("button", { name: /View All Available Helpers \(8\)/i });
    expect(viewAllHelpersBtn).toBeDefined();

    // Click to view all available helpers
    fireEvent.click(viewAllHelpersBtn);

    // Now 8 helpers should be displayed in the Helpers group
    expect(screen.getByText(/Helpers \(8\)/i)).toBeDefined();
    // Toggle button changes to "Show Matched (4)"
    expect(screen.getByRole("button", { name: /Show Matched \(4\)/i })).toBeDefined();

    // Checkboxes appear ONLY for Helpers (8 checkboxes total); Masons remain non-selectable
    expect(screen.getAllByRole("checkbox").length).toBe(8);
    expect(screen.getByText("Rajesh Kumar").closest('[role="checkbox"]')).toBeNull();

    // Additional helpers (e.g. Sunil Thomas, Anil Kumar) should now be visible
    expect(screen.getByText("Sunil Thomas")).toBeDefined();
    expect(screen.getByText("Anil Kumar")).toBeDefined();

    // Initially Sunil Thomas is unselected (Available on bench)
    const sunilRow = screen.getByText("Sunil Thomas").closest('[role="checkbox"]');
    expect(sunilRow).toBeDefined();
    expect(sunilRow?.getAttribute("aria-checked")).toBe("false");

    // Contractor can select Sunil Thomas
    if (sunilRow) {
      fireEvent.click(sunilRow);
    }
    expect(sunilRow?.getAttribute("aria-checked")).toBe("true");

    // Contractor can deselect a selected worker (e.g. Vipin Das)
    const vipinRow = screen.getByText("Vipin Das").closest('[role="checkbox"]');
    expect(vipinRow?.getAttribute("aria-checked")).toBe("true");
    if (vipinRow) {
      fireEvent.click(vipinRow);
    }
    expect(vipinRow?.getAttribute("aria-checked")).toBe("false");
  });

  it("clicking Decline opens the decline confirmation dialog with reason selection", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[0]);

    const declineBtn = screen.getByRole("button", { name: /^Decline$/i });
    fireEvent.click(declineBtn);

    expect(screen.getByText("Decline Request?")).toBeDefined();
    expect(screen.getByText(/Reason for Declining:/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Confirm Decline/i })).toBeDefined();
  });

  it("request details drawer can be closed cleanly", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[0]);

    const closeBtn = screen.getByRole("button", { name: /Close request details/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText("Tasks to Complete During This Period")).toBeNull();
  });

  it("displays View All Available button when candidates are available and hides it for shortage", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    // Open Skyline Apartments (Carpenters: 6 required, 6 available)
    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[1]); // Skyline Apartments is second card

    const acceptBtn = screen.getByRole("button", { name: /Accept & View Matched Candidates/i });
    fireEvent.click(acceptBtn);

    // For Carpenters (no shortage): View All Available button MUST display
    expect(screen.getByText(/Carpenters \(6\)/i)).toBeDefined();
    const viewAllCarpentersBtn = screen.getByRole("button", { name: /View All Available Carpenters \(10\)/i });
    expect(viewAllCarpentersBtn).toBeDefined();

    // Red shortage badge should NOT display for Carpenters
    expect(screen.queryByText(/6 Required/i)).toBeNull();

    // Click to view all available carpenters
    fireEvent.click(viewAllCarpentersBtn);

    // Now all 10 carpenters are displayed and selectable
    expect(screen.getByText(/Carpenters \(10\)/i)).toBeDefined();
    expect(screen.getByText("Suresh Pillai")).toBeDefined();
    expect(screen.getByText("Rajan K")).toBeDefined();
    expect(screen.getAllByRole("checkbox").length).toBe(10);
  });

  it("renders a clean full-width workforce requests workspace", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText(/DISPATCH ZONE:/i)).toBeDefined();
    expect(screen.queryByPlaceholderText(/Ask Odin about incoming workforce demand/i)).toBeNull();
  });
});
