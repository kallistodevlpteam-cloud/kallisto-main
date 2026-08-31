import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HandsAssignmentsWorkspace } from "@/partner-app/hands/components/assignments/hands-assignments-workspace";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/assignments",
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

describe("Kallisto Hands - Assignments Workspace & Structured Cards", () => {
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

  it("renders page header with Title, Subtitle and primary '+ Assign Crew' CTA", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByRole("heading", { level: 1, name: /Assignments/i })).toBeDefined();
    expect(screen.getByText(/Active project site allocations/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Assign Crew/i })).toBeDefined();
  });

  it("renders top telemetry strip with deployments and shift completion metrics", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getAllByText(/Active Deployments/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sites Covered/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Shift Completion/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Live")).toBeDefined();
  });

  it("renders 4 compact operational summary KPI cards", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getAllByText("14").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);
    expect(screen.getAllByText("128").length).toBeGreaterThan(0);
  });

  it("renders structured assignment cards with timeline day, health status, and workforce breakdown", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    // Greenwood Residency card checks
    expect(screen.getByText("Greenwood Residency")).toBeDefined();
    expect(screen.getByText("Kazhakkoottam, Kerala")).toBeDefined();
    expect(screen.getByText("12 Workers")).toBeDefined();
    expect(screen.getByText("Day 12 of 30")).toBeDefined();
    expect(screen.getAllByText(/Attendance Today:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/10 \/ 12 Present/i)).toBeDefined();
    expect(screen.getAllByText("⚠ ATTENTION REQUIRED").length).toBeGreaterThan(0);
  });

  it("renders Assignment Health badges (On Track, Attention Required, At Risk)", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getAllByText("● ON TRACK").length).toBeGreaterThan(0);
    expect(screen.getAllByText("⚠ ATTENTION REQUIRED").length).toBeGreaterThan(0);
    expect(screen.getAllByText("● AT RISK").length).toBeGreaterThan(0);
  });

  it("filters assignment cards by health tabs (On Track, Attention Required, At Risk)", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    const onTrackTab = screen.getByRole("tab", { name: /On Track/i });
    fireEvent.click(onTrackTab);

    // Skyline should be visible, Greenwood (attention required) should not
    expect(screen.getByText("Skyline Waterfront Towers")).toBeDefined();
    expect(screen.queryByText("Greenwood Residency")).toBeNull();
  });

  it("opens assignment detail drawer when clicking Open Assignment button", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    const openBtns = screen.getAllByRole("button", { name: /Open Assignment/i });
    fireEvent.click(openBtns[0]);

    expect(screen.getByText(/Deployed Crew Roster/i)).toBeDefined();
    expect(screen.getByText("Suresh Nair")).toBeDefined();
    expect(screen.getByText("Rajesh Kumar")).toBeDefined();
  });

  it("opens assignment detail drawer when clicking directly on the card body", () => {
    render(
      <PartnerAuthProvider>
        <HandsAssignmentsWorkspace />
      </PartnerAuthProvider>
    );

    const card = screen.getByRole("button", { name: "Assignment for Greenwood Residency" });
    fireEvent.click(card);

    expect(screen.getByText(/Deployed Crew Roster/i)).toBeDefined();
    expect(screen.getAllByText("Greenwood Residency").length).toBeGreaterThan(1);
    expect(screen.getByText("Suresh Nair")).toBeDefined();
  });
});
