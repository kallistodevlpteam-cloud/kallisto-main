import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppShell } from "../components/layout/app-shell";
import { isSidebarItemActive, SIDEBAR_NAVIGATION } from "../components/layout/sidebar-navigation";
import { homeWorkspaceService } from "../services/repositories/home-workspace-service";

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1920,
  });
});

afterEach(cleanup);

describe("AppShell", () => {
  it("uses the required workflow hierarchy from one navigation configuration", () => {
    expect(SIDEBAR_NAVIGATION.map((item) => item.label)).toEqual([
      "Hive Studio",
      "Enquiries",
      "Projects",
      "Calendar",
      "Team",
      "Payments",
      "Analytics",
      "Portfolio",
      "Hub",
      "Hands",
      "Basics",
      "Developer",
      "More tools",
    ]);
  });

  it("matches direct and nested navigation routes", () => {
    expect(isSidebarItemActive("/", "/studio")).toBe(true);
    expect(isSidebarItemActive("/projects/residence-24", "/projects")).toBe(true);
    expect(isSidebarItemActive("/project-settings", "/projects")).toBe(false);
  });

  it("loads the Enquiries badge from the workspace data source", async () => {
    render(<AppShell />);

    expect(await screen.findByLabelText("4 pending enquiries")).toHaveTextContent("4");
    expect(await homeWorkspaceService.getPendingEnquiryCount()).toBe(4);
  });

  it("renders the new section labels without the removed Pinned label", () => {
    render(<AppShell />);

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("Presence")).toBeInTheDocument();
    expect(screen.getByText("Connectors")).toBeInTheDocument();
    expect(screen.queryByText("Pinned")).not.toBeInTheDocument();
  });

  it("opens and closes the Odin workspace", () => {
    render(<AppShell />);

    const askButton = screen.getByRole("button", { name: /^ask odin$/i });
    expect(screen.queryByRole("complementary", { name: /odin assistant/i })).not.toBeInTheDocument();

    fireEvent.click(askButton);
    expect(askButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("complementary", { name: /odin assistant/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close assistant panel/i }));
    expect(screen.queryByRole("complementary", { name: /odin assistant/i })).not.toBeInTheDocument();
  });

  it("toggles sidebar between expanded and collapsed modes", () => {
    render(<AppShell />);

    const collapseButton = screen.getAllByRole("button", { name: /collapse sidebar/i })[0];
    expect(screen.getByRole("complementary", { name: /primary navigation/i })).toBeInTheDocument();

    fireEvent.click(collapseButton);
    expect(screen.getByRole("complementary", { name: /compact navigation/i })).toBeInTheDocument();

    const expandButton = screen.getAllByRole("button", { name: /expand sidebar/i })[0];
    fireEvent.click(expandButton);
    expect(screen.getByRole("complementary", { name: /primary navigation/i })).toBeInTheDocument();
  });

  it("opens and closes mobile navigation drawer", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: /open navigation/i }));
    expect(screen.getByRole("button", { name: /close navigation/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close navigation/i }));
    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();
  });

  it("renders the fullscreen toggle button next to notifications", () => {
    render(<AppShell />);
    const fullscreenButton = screen.getByRole("button", { name: /enter full screen/i });
    expect(fullscreenButton).toBeInTheDocument();
  });

  it("opens locked feature modal when clicking locked sidebar items (Team, Payments, Analytics)", () => {
    render(<AppShell />);

    // Click Team (locked)
    const teamButton = screen.getByRole("button", { name: /team \(locked feature\)/i });
    fireEvent.click(teamButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Team Management Locked")).toBeInTheDocument();
    expect(screen.getByText(/Collaborative member provisioning/i)).toBeInTheDocument();

    // Dismiss modal
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click Payments (locked)
    const paymentsButton = screen.getByRole("button", { name: /payments \(locked feature\)/i });
    fireEvent.click(paymentsButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Financial & Payments Portal Locked")).toBeInTheDocument();

    // Dismiss modal
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click Analytics (locked)
    const analyticsButton = screen.getByRole("button", { name: /analytics \(locked feature\)/i });
    fireEvent.click(analyticsButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Performance Analytics Locked")).toBeInTheDocument();
  });
});

