import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import HandsAttendancePage from "@/app/partner/hands/attendance/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hands/attendance",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("HandsAttendancePage - Attendance & Time-Tracking Workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page title, subtitle, submeta indicators, and top KPI cards", () => {
    render(<HandsAttendancePage />);

    expect(screen.getByRole("heading", { name: "Attendance & Time-Tracking", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText("Daily biometric geotag logs, supervisor shift approvals, overtime tracking, and compliance records.")
    ).toBeInTheDocument();

    expect(screen.getAllByText("Active Deployments").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sites Covered").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Deployed Crew").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Shift Completion").length).toBeGreaterThan(0);
  });

  it("renders tab navigation and live attendance records table by default", () => {
    render(<HandsAttendancePage />);

    const tabsNav = screen.getByRole("tablist", { name: /attendance views/i });
    expect(within(tabsNav).getByRole("tab", { name: /live biometric logs/i })).toBeInTheDocument();
    expect(within(tabsNav).getByRole("tab", { name: /site deployment summary/i })).toBeInTheDocument();

    // Default table contains worker rows
    expect(screen.getAllByText("Rajesh Kumar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Greenwood Residency").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Arun S").length).toBeGreaterThan(0);
  });

  it("filters attendance records by search input", () => {
    render(<HandsAttendancePage />);

    const searchInput = screen.getByPlaceholderText(/Search worker/i);
    fireEvent.change(searchInput, { target: { value: "Rajesh" } });

    expect(screen.getAllByText("Rajesh Kumar").length).toBeGreaterThan(0);
    expect(screen.queryByText("Arun S")).not.toBeInTheDocument();
  });

  it("filters attendance records by status filter dropdown (e.g. Late)", () => {
    render(<HandsAttendancePage />);

    const statusSelect = screen.getByRole("combobox", { name: /filter status/i });
    fireEvent.change(statusSelect, { target: { value: "Late" } });

    expect(screen.getByText("Suresh P")).toBeInTheDocument();
    expect(screen.getByText("Karan Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Rajesh Kumar")).not.toBeInTheDocument();
  });

  it("switches to Site Deployment Summary tab and displays site cards", () => {
    render(<HandsAttendancePage />);

    const tabsNav = screen.getByRole("tablist", { name: /attendance views/i });
    const siteTab = within(tabsNav).getByRole("tab", { name: /site deployment summary/i });
    fireEvent.click(siteTab);

    expect(screen.getByText("Greenwood Residency")).toBeInTheDocument();
    expect(screen.getByText("Sobha Silver Birch Enclave")).toBeInTheDocument();
    expect(screen.getByText("Malabar Heritage Estate")).toBeInTheDocument();
    expect(screen.getByText("Azure Waterfront Towers")).toBeInTheDocument();
  });

  it("opens biometric detail inspection modal when clicking View Details from 3-dots menu", () => {
    render(<HandsAttendancePage />);

    const actionBtn = screen.getByRole("button", { name: /actions for rajesh kumar/i });
    fireEvent.click(actionBtn);

    const viewDetailsBtn = screen.getByRole("button", { name: /view details/i });
    fireEvent.click(viewDetailsBtn);

    const modal = screen.getByRole("dialog", { name: /biometric log for rajesh kumar/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("Check-In Time")).toBeInTheDocument();
    expect(within(modal).getByText("Site Name:")).toBeInTheDocument();
    expect(within(modal).getByText("Greenwood Residency")).toBeInTheDocument();

    const closeBtn = within(modal).getByRole("button", { name: /close modal/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens timesheet export modal when clicking Export Timesheet button", () => {
    render(<HandsAttendancePage />);

    const exportBtns = screen.getAllByRole("button", { name: /export timesheet/i });
    fireEvent.click(exportBtns[0]);

    const modal = screen.getByRole("dialog", { name: /export attendance timesheet/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("Export File Format")).toBeInTheDocument();

    const cancelBtn = within(modal).getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not render Odin Attendance Intelligence right panel", () => {
    render(<HandsAttendancePage />);

    expect(screen.queryByRole("complementary", { name: /odin attendance intelligence/i })).not.toBeInTheDocument();
  });
});
