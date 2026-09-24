import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HandsWorkerDetailWorkspace } from "@/partner-app/hands/components/workers/hands-worker-detail-workspace";
import { getWorkerById } from "@/partner-app/hands/mock/workers-mock-data";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/workers/KH-W-1042",
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

describe("Worker Detail Page - Grouped Tab Navigation & Full Width View", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(cleanup);

  it("loads worker profile by ID and renders initial Overview tab content", () => {
    const worker = getWorkerById("KH-W-1042");
    expect(worker).not.toBeNull();

    if (!worker) return;

    render(
      <PartnerAuthProvider>
        <HandsWorkerDetailWorkspace worker={worker} />
      </PartnerAuthProvider>
    );

    // Header banner
    expect(screen.getAllByText("Rajesh Kumar").length).toBeGreaterThan(0);
    expect(screen.getByText("KH-W-1042")).toBeDefined();

    // Tabs present in navigation bar
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getByRole("tab", { name: "Personal Details & Skills" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Project History" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Attendance History" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Payment & Bank Details" })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Documents/i })).toBeDefined();

    // Initial Overview tab content with Today's Assigned Tasks & Next Tasks
    expect(screen.getByText("CURRENT PROJECT & TASKS")).toBeDefined();
    expect(screen.getByText("Today's Assigned Tasks (2 Tasks)")).toBeDefined();
    expect(screen.getByText("NEXT SCHEDULED TASKS")).toBeDefined();
    expect(screen.getByText("Recent Activity Log")).toBeDefined();
  });

  it("switches tab content when clicking Personal Details & Skills tab", () => {
    const worker = getWorkerById("KH-W-1042");
    if (!worker) return;

    render(
      <PartnerAuthProvider>
        <HandsWorkerDetailWorkspace worker={worker} />
      </PartnerAuthProvider>
    );

    const personalTab = screen.getByRole("tab", { name: "Personal Details & Skills" });
    fireEvent.click(personalTab);

    // Grouped Personal & Skills content (Basic Information, Contact & Address, Skills & Work Performance)
    expect(screen.getByText("Basic Information")).toBeDefined();
    expect(screen.getByText("Contact & Address")).toBeDefined();
    expect(screen.getByText("Skills & Work Performance")).toBeDefined();
  });

  it("switches tab content when clicking Payment & Bank Details tab", () => {
    const worker = getWorkerById("KH-W-1042");
    if (!worker) return;

    render(
      <PartnerAuthProvider>
        <HandsWorkerDetailWorkspace worker={worker} />
      </PartnerAuthProvider>
    );

    const paymentTab = screen.getByRole("tab", { name: "Payment & Bank Details" });
    fireEvent.click(paymentTab);

    // Grouped Payment & Bank Details content
    expect(screen.getByText("Wage Disbursement Transaction Ledger")).toBeDefined();
    expect(screen.getByText("Verified Bank Account & UPI Details")).toBeDefined();
    expect(screen.getByText("State Bank of India")).toBeDefined();
  });

  it("switches tab content when clicking Project History tab and renders KPI cards and table", () => {
    const worker = getWorkerById("KH-W-1042");
    if (!worker) return;

    render(
      <PartnerAuthProvider>
        <HandsWorkerDetailWorkspace worker={worker} />
      </PartnerAuthProvider>
    );

    const projectHistoryTab = screen.getByRole("tab", { name: "Project History" });
    fireEvent.click(projectHistoryTab);

    // Assert Project History summary KPI cards and data table header
    expect(screen.getByText("PROJECTS COMPLETED")).toBeDefined();
    expect(screen.getByText("FIELD EXPERIENCE")).toBeDefined();
    expect(screen.getByText("ON-TIME COMPLETION")).toBeDefined();
    expect(screen.getByText("Project Name & Scope")).toBeDefined();
  });

  it("switches tab content when clicking Attendance History tab and renders calendar heatmap card", () => {
    const worker = getWorkerById("KH-W-1042");
    if (!worker) return;

    render(
      <PartnerAuthProvider>
        <HandsWorkerDetailWorkspace worker={worker} />
      </PartnerAuthProvider>
    );

    const attendanceTab = screen.getByRole("tab", { name: "Attendance History" });
    fireEvent.click(attendanceTab);

    // Assert September 2026 calendar heat map month selector heading and legend
    expect(screen.getByText("September 2026")).toBeDefined();
    expect(screen.getByText("Attendance & Work History Log")).toBeDefined();
  });
});
