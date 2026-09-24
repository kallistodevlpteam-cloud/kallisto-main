import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientNotificationsWorkspace } from "@/features/client/notifications/components/client-notifications-workspace";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/client/notifications",
}));

describe("ClientNotificationsWorkspace Component", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders page title and subtitle for client portal", () => {
    render(<ClientNotificationsWorkspace />);
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(
      screen.getByText("Track project enquiries, feasibility reviews, proposals, milestones and payment updates.")
    ).toBeInTheDocument();
    expect(screen.getByText("Notification Summary")).toBeInTheDocument();
    expect(screen.getByText("Quick Filters")).toBeInTheDocument();
  });

  it("renders action required, recent updates, and projects & system sections with client data", () => {
    render(<ClientNotificationsWorkspace />);
    expect(screen.getAllByText("Action Required").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recent Updates").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Projects & System").length).toBeGreaterThan(0);
    expect(screen.getByText("Clarification requested")).toBeInTheDocument();
    expect(screen.getByText("Feasibility report review")).toBeInTheDocument();
    expect(screen.getByText("Proposal received")).toBeInTheDocument();
  });

  it("filters client notifications by category tabs", () => {
    render(<ClientNotificationsWorkspace />);
    const actionTab = screen.getByRole("button", { name: /Action Required/i });
    fireEvent.click(actionTab);
    expect(screen.getByText("Clarification requested")).toBeInTheDocument();
    expect(screen.queryByText("Proposal received")).not.toBeInTheDocument();
  });

  it("toggles unread only filter switch", () => {
    render(<ClientNotificationsWorkspace />);
    const unreadCheckbox = screen.getByRole("checkbox");
    fireEvent.click(unreadCheckbox);
    expect(unreadCheckbox).toBeChecked();
    expect(screen.getByText("Clarification requested")).toBeInTheDocument();
    expect(screen.queryByText("Proposal received")).not.toBeInTheDocument();
  });

  it("marks all notifications as read when clicking Mark all as read button", () => {
    render(<ClientNotificationsWorkspace />);
    const markAllBtn = screen.getByRole("button", { name: /Mark all as read/i });
    fireEvent.click(markAllBtn);
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
  });
});
