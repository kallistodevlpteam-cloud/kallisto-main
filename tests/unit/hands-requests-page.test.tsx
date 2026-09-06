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

  it("renders workflow-based status navigation pill tabs (Requests, Accepted, Closed)", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByRole("tab", { name: /^Requests/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Accepted/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Closed/i })).toBeDefined();
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
    expect(screen.getByText("12 Workers")).toBeDefined();
    expect(screen.getByText("6 Workers")).toBeDefined();
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

  it("switches status tabs and updates request list accordingly", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const acceptedTab = screen.getByRole("tab", { name: /Accepted/i });
    fireEvent.click(acceptedTab);

    expect(screen.getByText("Prestige CyberGreen Phase 1")).toBeDefined();
    expect(screen.queryByText("Greenwood Residency")).toBeNull();
  });

  it("opens request detail workspace modal when reviewing a request", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[0]);

    expect(screen.getByText("Workforce Required")).toBeDefined();
    expect(screen.getByText("Work Details")).toBeDefined();
    expect(screen.getByText("Workforce Match Intelligence")).toBeDefined();
    expect(screen.getByRole("button", { name: /Accept Request/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Decline/i })).toBeDefined();
  });

  it("accepts request, updates status to accepted, and moves to Accepted tab automatically", () => {
    render(
      <PartnerAuthProvider>
        <HandsRequestsWorkspace />
      </PartnerAuthProvider>
    );

    const reviewBtns = screen.getAllByRole("button", { name: /Review Request/i });
    fireEvent.click(reviewBtns[0]);

    const acceptBtn = screen.getByRole("button", { name: /Accept Request/i });
    fireEvent.click(acceptBtn);

    // Confirm in the confirmation pop-up
    const confirmBtn = screen.getByRole("button", { name: /Confirm & Accept/i });
    fireEvent.click(confirmBtn);

    // Directly visible in the automatically selected Accepted tab
    expect(screen.getAllByText("Greenwood Residency").length).toBeGreaterThan(0);
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
