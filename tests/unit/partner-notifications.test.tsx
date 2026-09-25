import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PartnerNotificationsWorkspace } from "@/partner-app/notifications/components/partner-notifications-workspace";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/partner/notifications",
}));

describe("PartnerNotificationsWorkspace Component", () => {
  beforeEach(() => {
    cleanup();
    mockPush.mockClear();
  });

  it("renders page title and subtitle", () => {
    render(<PartnerNotificationsWorkspace />);
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(
      screen.getByText("Stay updated on labor requests, assignments, schedules and project activities.")
    ).toBeInTheDocument();
    expect(screen.getByText("Notification Summary")).toBeInTheDocument();
    expect(screen.getByText("Quick Filters")).toBeInTheDocument();
  });

  it("renders action required, recent updates, and projects & system sections", () => {
    render(<PartnerNotificationsWorkspace />);
    expect(screen.getAllByText("Action Required").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recent Updates").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Projects & System").length).toBeGreaterThan(0);
    expect(screen.getAllByText("New labor request").length).toBeGreaterThan(0);
    expect(screen.getByText("Labor not available")).toBeInTheDocument();
    expect(screen.getByText("Assignment confirmed")).toBeInTheDocument();
  });

  it("filters notifications by category pills", () => {
    render(<PartnerNotificationsWorkspace />);
    const requestsPills = screen.getAllByRole("button", { name: /Requests/i });
    fireEvent.click(requestsPills[0]);
    expect(screen.getAllByText("New labor request").length).toBeGreaterThan(0);
    expect(screen.queryByText("Schedule change")).not.toBeInTheDocument();
  });

  it("toggles unread only filter switch", () => {
    render(<PartnerNotificationsWorkspace />);
    const unreadCheckbox = screen.getByRole("checkbox");
    fireEvent.click(unreadCheckbox);
    expect(unreadCheckbox).toBeChecked();
    expect(screen.getByText("New labor request")).toBeInTheDocument();
    expect(screen.queryByText("Assignment confirmed")).not.toBeInTheDocument();
  });

  it("marks notification as read and navigates to targetUrl when an entry is clicked", () => {
    render(<PartnerNotificationsWorkspace />);
    const firstNotification = screen.getAllByText("New labor request")[0];
    fireEvent.click(firstNotification.closest("div[class*='itemRow']") || firstNotification);

    expect(mockPush).toHaveBeenCalledWith("/partner/hands/requests");
  });
});
